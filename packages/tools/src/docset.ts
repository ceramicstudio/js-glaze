import type { CeramicApi, StreamMetadata } from '@ceramicnetwork/common'
import type { StreamRef } from '@ceramicnetwork/streamid'
import type { TileDocument } from '@ceramicnetwork/stream-tile'
import type { GraphQLDocSetRecords, ItemField, ObjectField } from '@ceramicstudio/idx-graphql-types'
import { camelCase, pascalCase } from 'change-case'
import type { DagJWSResult } from 'dids'

import { decodeSignedMap, encodeSignedMap } from './encoding'
import { createDefinition, createTile, publishCommits, publishSchema } from './publishing'
import type { Definition, EncodedDagJWSResult, Schema } from './types'
import { docIDToString } from './utils'

export const CERAMIC_APPEND_COLLECTION = 'ceramic:appendCollection:'
export const CERAMIC_DOC = 'ceramic:doc:'

export type CreatedDoc = {
  id: StreamRef
  dependencies: Array<StreamRef>
}

export type PublishedDocSet = {
  definitions: Record<string, string>
  schemas: Record<string, string>
  tiles: Record<string, string>
}

export type DocSetData<T> = {
  docs: Record<string, T>
  definitions: Array<string>
  schemas: Array<string>
}
export type SignedDocSet = DocSetData<Array<DagJWSResult>>
export type EncodedSignedDocSet = DocSetData<Array<EncodedDagJWSResult>>

export type AddDocSetSchemaOptions = {
  name?: string
  parent?: string
  owner?: string
}

function getName(base: string, prefix = ''): string {
  const withCase = pascalCase(base)
  return withCase.startsWith(prefix) ? withCase : prefix + withCase
}

function getReference(schema: Schema): Array<string> | null {
  if (schema.$comment?.startsWith(CERAMIC_DOC)) {
    const schemasString = schema.$comment.substr(CERAMIC_DOC.length)
    if (schemasString.length) {
      const schemas = schemasString.split('|')
      schemas.sort()
      return schemas
    }
  }
  return null
}

export function getItemField(
  records: GraphQLDocSetRecords,
  schema: Schema,
  parent: string,
  owner: string
): ItemField {
  const name = schema.title ?? ''
  if (schema.type === 'array') {
    throw new Error('Unsupported item field of type array')
  }
  if (schema.type === 'string') {
    const schemas = getReference(schema)
    if (schemas == null) {
      return { ...schema, type: 'string' }
    }

    const refName = getName(name, parent)
    const ref = { schemas, owner }
    records.references[refName] = ref
    return { type: 'reference', ...ref }
  }
  if (schema.type === 'object') {
    return { type: 'object', name: addDocSetSchema(records, schema, { name, parent, owner }) }
  }
  return schema as ItemField
}

// Add a JSON schema to the provided records based on its type
export function addDocSetSchema(
  records: GraphQLDocSetRecords,
  schema: Schema,
  options: AddDocSetSchemaOptions = {}
): string {
  const providedTitle = options.name ?? schema.title
  if (providedTitle == null) {
    throw new Error('Schema must have a title')
  }

  // TODO: add parents?: Array<string> to options
  // If no parent and type object, treat as node and use canonical name
  // Make sure object doesn't already exist in records, if so just add extra parents
  const name = getName(providedTitle, options.parent)

  if (schema.type === 'string') {
    const reference = getReference(schema)
    if (reference != null) {
      records.references[name] = { schemas: reference, owner: options.owner as string }
    }
  } else if (schema.type === 'array' && schema.items != null) {
    records.lists[name] = getItemField(records, schema.items, name, options.owner as string)
  } else if (schema.type === 'object' && schema.properties != null) {
    const requiredProps = (schema.required as Array<string>) ?? []
    const fields = Object.entries(schema.properties as Record<string, any>).reduce(
      (acc, [key, value]: [string, Schema]) => {
        const propName = (value.title as string) ?? key
        const prop = camelCase(key)
        const opts = { name: propName, parent: name, owner: options.owner ?? name }
        const required = requiredProps.includes(key)
        if (value.type === 'string') {
          const reference = getReference(value)
          if (reference == null) {
            acc[prop] = { ...value, required, type: 'string' }
          } else {
            const refName = getName(propName, name)
            const ref = { schemas: reference, owner: options.owner ?? name }
            records.references[refName] = ref
            acc[prop] = { required, type: 'reference', ...ref }
          }
        } else if (value.type === 'array') {
          if (value.items == null) {
            throw new Error(`Missing items in field ${key}`)
          }
          acc[prop] = { required, type: 'list', name: addDocSetSchema(records, value, opts) }
        } else if (value.type === 'object') {
          acc[prop] = { required, type: 'object', name: addDocSetSchema(records, value, opts) }
        } else {
          acc[prop] = { ...value, required } as ObjectField
        }
        return acc
      },
      {} as Record<string, ObjectField>
    )
    records.objects[name] = { fields, parents: options.parent ? [options.parent] : null }
  }

  return name
}

// Recursively extract references to other schemas from a JSON schema arrays and objects
function extractSchemaReferences(schema: Schema): Array<string> {
  if (schema.type === 'string') {
    return getReference(schema) ?? []
  }
  if (schema.type === 'array') {
    return extractSchemaReferences(schema.items)
  }
  if (schema.type === 'object' && schema.properties != null) {
    return Object.values(schema.properties as Record<string, Schema>).flatMap(
      extractSchemaReferences
    )
  }
  return []
}

export class DocSet {
  _ceramic: CeramicApi
  _docs: Record<string, Promise<TileDocument>> = {}
  _definitions: Record<string, Promise<CreatedDoc>> = {}
  _schemas: Record<string, Promise<CreatedDoc>> = {}
  _schemaAliases: Record<string, string> = {}
  _tiles: Record<string, Promise<CreatedDoc>> = {}

  constructor(ceramic: CeramicApi) {
    if (ceramic.did == null || !ceramic.did.authenticated) {
      throw new Error('Ceramic instance must be authenticated')
    }
    this._ceramic = ceramic
  }

  async loadCreated(created: Promise<CreatedDoc>): Promise<TileDocument> {
    return await this.loadDoc((await created).id)
  }

  async loadDoc(streamID: StreamRef | string): Promise<TileDocument> {
    const id = docIDToString(streamID)
    if (this._docs[id] == null) {
      this._docs[id] = this._ceramic.loadStream<TileDocument>(id)
    }
    return await this._docs[id]
  }

  get definitions(): Array<string> {
    return Object.keys(this._definitions)
  }

  get schemas(): Array<string> {
    return Object.keys(this._schemas)
  }

  get tiles(): Array<string> {
    return Object.keys(this._tiles)
  }

  hasSchema(alias: string): boolean {
    return this._schemas[alias] != null
  }

  getSchema(alias: string): Promise<CreatedDoc> | null {
    return this._schemas[alias] ?? null
  }

  deleteSchema(alias: string): boolean {
    if (this.hasSchema(alias)) {
      delete this._schemas[alias]
      return true
    }
    return false
  }

  createSchema(
    name: string,
    schema: Schema,
    deps: Array<Promise<StreamRef>> = []
  ): Promise<CreatedDoc> {
    if (this.hasSchema(name)) {
      throw new Error(`Schema ${name} already exists`)
    }

    this._schemas[name] = Promise.all(deps).then((dependencies) => {
      return publishSchema(this._ceramic, { name, content: schema }).then(
        (doc) => {
          this._schemaAliases[doc.commitId.toUrl()] = name
          return { id: doc.commitId, dependencies }
        },
        (reason: any) => {
          delete this._schemas[name]
          throw reason
        }
      )
    })
    return this._schemas[name]
  }

  async addSchema(schema: Schema, alias?: string): Promise<StreamRef> {
    const name = alias ?? schema.title
    if (name == null) {
      throw new Error('Schema must have a title property or an alias must be provided')
    }

    const schemaRefs = new Set(extractSchemaReferences(schema))
    const deps = Array.from(schemaRefs).map(async (id) => {
      return await this.useExistingSchema(id)
    })

    const created = await this.createSchema(name, schema, deps)
    return created.id
  }

  async useExistingSchema(id: StreamRef | string, alias?: string): Promise<StreamRef> {
    const existingAlias = this._schemaAliases[docIDToString(id)]
    if (existingAlias != null) {
      const existing = this._schemas[existingAlias]
      if (existing == null) {
        throw new Error(`Alias ${existingAlias} exists for this schema but no schema is attached`)
      }
      return (await existing).id
    }

    const doc = await this.loadDoc(id)
    const content = (doc.content ?? {}) as Schema
    const name = alias ?? content.title
    if (name == null) {
      throw new Error('Schema must have a title property or an alias must be provided')
    }

    const schemaRefs = new Set(extractSchemaReferences(content))
    this._schemas[name] = Promise.all(
      Array.from(schemaRefs).map(async (id) => await this.useExistingSchema(id))
    ).then(
      (dependencies) => {
        this._schemaAliases[doc.commitId.toUrl()] = name
        return { id: doc.commitId, dependencies }
      },
      (reason: any) => {
        delete this._schemas[name]
        throw reason
      }
    )

    return doc.commitId
  }

  hasDefinition(alias: string): boolean {
    return this._definitions[alias] != null
  }

  getDefinition(alias: string): Promise<CreatedDoc> | null {
    return this._definitions[alias] ?? null
  }

  deleteDefinition(alias: string): boolean {
    if (this.hasDefinition(alias)) {
      delete this._definitions[alias]
      return true
    }
    return false
  }

  createDefinition(
    alias: string,
    definition: Definition,
    deps: Array<Promise<StreamRef>> = []
  ): Promise<CreatedDoc> {
    if (this.hasDefinition(alias)) {
      throw new Error(`Definition ${alias} already exists`)
    }

    this._definitions[alias] = Promise.all(deps).then((dependencies) => {
      return createDefinition(this._ceramic, definition).then(
        (doc) => ({ id: doc.id, dependencies }),
        (reason: any) => {
          delete this._definitions[alias]
          throw reason
        }
      )
    })
    return this._definitions[alias]
  }

  async addDefinition(definition: Definition, alias = definition.name): Promise<StreamRef> {
    const created = await this.createDefinition(alias, definition, [
      this.useExistingSchema(definition.schema),
    ])
    return created.id
  }

  hasTile(alias: string): boolean {
    return this._tiles[alias] != null
  }

  getTile(alias: string): Promise<CreatedDoc> | null {
    return this._tiles[alias] ?? null
  }

  deleteTile(alias: string): boolean {
    if (this.hasTile(alias)) {
      delete this._tiles[alias]
      return true
    }
    return false
  }

  createTile<T extends Record<string, unknown>>(
    alias: string,
    contents: T,
    meta: Partial<StreamMetadata>,
    deps: Array<Promise<StreamRef>> = []
  ): Promise<CreatedDoc> {
    if (this.hasTile(alias)) {
      throw new Error(`Tile ${alias} already exists`)
    }

    this._tiles[alias] = Promise.all(deps).then((dependencies) => {
      return createTile(this._ceramic, contents, meta).then(
        (doc) => ({ id: doc.id, dependencies }),
        (reason: any) => {
          delete this._tiles[alias]
          throw reason
        }
      )
    })
    return this._tiles[alias]
  }

  async addTile<T extends Record<string, unknown>>(
    alias: string,
    contents: T,
    meta: Partial<StreamMetadata>
  ): Promise<StreamRef> {
    if (meta.schema == null) {
      throw new Error('Missing schema to add tile')
    }
    const created = await this.createTile(alias, contents, meta, [
      this.useExistingSchema(meta.schema),
    ])
    return created.id
  }

  async toGraphQLDocSetRecords(): Promise<GraphQLDocSetRecords> {
    // TODO: throw error on using reserved names:
    // - "node" and "index" roots
    // - "id" field in object if node

    const records: GraphQLDocSetRecords = {
      collections: {},
      index: {},
      lists: {},
      objects: {},
      referenced: {},
      references: {},
      roots: {},
    }

    const handleSchemas = this.schemas.map(async (name) => {
      const created = this.getSchema(name)
      if (created != null) {
        const doc = await this.loadCreated(created)
        const schema = doc.content as Schema
        if (schema == null) {
          throw new Error(`Could not load schema ${name}`)
        }

        const schemaURL = doc.commitId.toUrl()
        if (schema.$comment?.startsWith(CERAMIC_APPEND_COLLECTION)) {
          const sliceSchemaID = schema.$comment.substr(CERAMIC_APPEND_COLLECTION.length)
          await this.useExistingSchema(sliceSchemaID)
          const sliceSchemaDoc = await this.loadDoc(sliceSchemaID)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const itemSchema = sliceSchemaDoc.content?.properties?.contents?.items?.oneOf?.[0] as
            | Schema
            | undefined
          if (itemSchema == null) {
            throw new Error(`Could not extract item schema ${name}`)
          }
          records.collections[name] = {
            schema: schemaURL,
            item: getItemField(records, itemSchema, name, name),
          }
          records.referenced[schemaURL] = { type: 'collection', name }
        } else {
          records.referenced[schemaURL] = {
            type: 'object',
            name: addDocSetSchema(records, schema),
          }
        }
      }
    })

    const handleDefinitions = this.definitions.map(async (name) => {
      const created = this.getDefinition(name)
      if (created != null) {
        const doc = await this.loadCreated(created)
        const definition = doc.content as Definition
        if (definition == null) {
          throw new Error(`Could not load definition ${name}`)
        }
        records.index[name] = { id: doc.id.toString(), schema: definition.schema }
      }
    })

    const handleTiles = this.tiles.map(async (name) => {
      const created = this.getTile(name)
      if (created != null) {
        const doc = await this.loadCreated(created)
        const { schema } = doc.metadata
        if (schema == null) {
          throw new Error(`Missing schema for tile ${name}`)
        }
        records.roots[name] = { id: doc.id.toString(), schema }
      }
    })

    await Promise.all([...handleSchemas, ...handleDefinitions, ...handleTiles])

    return records
  }

  // Export to maps of aliases to published doc IDs/URLs
  async toPublished(): Promise<PublishedDocSet> {
    const definitions: Record<string, string> = {}
    const schemas: Record<string, string> = {}
    const tiles: Record<string, string> = {}

    const handleDefinitions = Object.entries(this._definitions).map(async ([alias, created]) => {
      const { id } = await created
      definitions[alias] = id.toString()
    })
    const handleSchemas = Object.entries(this._schemas).map(async ([alias, created]) => {
      const { id } = await created
      schemas[alias] = id.toUrl()
    })
    const handleTiles = Object.entries(this._tiles).map(async ([alias, created]) => {
      const { id } = await created
      tiles[alias] = id.toString()
    })
    await Promise.all([...handleDefinitions, ...handleSchemas, ...handleTiles])

    return { definitions, schemas, tiles }
  }

  // Export to maps of aliases to signed commits, would allow to publish a docset on a Ceramic node
  async toSigned(): Promise<SignedDocSet> {
    const deps = new Set<string>()
    const docs: Record<string, Array<DagJWSResult>> = {}
    const definitions: Array<string> = []
    const schemas: Array<string> = []

    const addDoc = async (created: Promise<CreatedDoc>) => {
      const { id, dependencies } = await created
      dependencies.forEach((depid) => {
        deps.add(depid.toString())
      })
      const streamid = id.baseID
      const commits = await this._ceramic.loadStreamCommits(streamid)
      docs[id.toString()] = commits.map((r) => r.value as DagJWSResult)
    }

    const handleDefinitions = Object.entries(this._definitions).map(async ([alias, created]) => {
      definitions.push(alias)
      return await addDoc(created)
    })
    const handleSchemas = Object.entries(this._schemas).map(async ([alias, created]) => {
      schemas.push(alias)
      await addDoc(created)
    })
    const handleTiles = Object.values(this._tiles).map(addDoc)
    await Promise.all([...handleDefinitions, ...handleSchemas, ...handleTiles])

    deps.forEach((id) => {
      if (docs[id] == null) {
        throw new Error(`Missing dependency: ${id}`)
      }
    })

    return { docs, definitions, schemas }
  }

  // Export signed commits to JSON
  async toSignedJSON(): Promise<EncodedSignedDocSet> {
    const { docs, ...signed } = await this.toSigned()
    return { ...signed, docs: encodeSignedMap(docs) }
  }
}

// Publish a signed docset to the given Ceramic node
export async function publishSignedDocSet(
  ceramic: CeramicApi,
  docSet: SignedDocSet
): Promise<void> {
  const schemas: Array<Promise<TileDocument>> = []
  const others: Array<Promise<TileDocument>> = []

  Object.entries(docSet.docs).forEach(([id, commits]) => {
    const publish = publishCommits(ceramic, commits)
    if (docSet.schemas.includes(id)) {
      schemas.push(publish)
    } else {
      others.push(publish)
    }
  })

  await Promise.all(schemas)
  await Promise.all(others)
}

// Publish a JSON-encoded signed docset to the given Ceramic node
export async function publishEncodedSignedDocSet(
  ceramic: CeramicApi,
  { docs, ...docSet }: EncodedSignedDocSet
): Promise<void> {
  return await publishSignedDocSet(ceramic, { ...docSet, docs: decodeSignedMap(docs) })
}
