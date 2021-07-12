/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import type { CeramicApi, StreamMetadata } from '@ceramicnetwork/common'
import { CommitID, StreamID } from '@ceramicnetwork/streamid'
import type { StreamRef } from '@ceramicnetwork/streamid'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { CIP88_REF_PREFIX } from '@glazed/constants'
import type { Definition } from '@glazed/core-datamodel'
import { model as coreModel } from '@glazed/core-datamodel'
import type { EncodedSignedModel, PublishedModel, Schema, SignedModel } from '@glazed/types'
import type { DagJWSResult } from 'dids'

import { decodeSignedMap, encodeSignedMap } from './encoding'
import { createTile, publishCommits } from './publishing'
import { applyMap, promiseMap, streamIDToString } from './utils'

type CoreModel = {
  definitions: Record<string, never>
  schemas: {
    Definition: string
    IdentityIndex: string
  }
  tiles: Record<string, never>
}

export type CreatedDoc = {
  id: StreamRef
  dependencies: Array<StreamRef>
}

export type ManagedModel = {
  docs: Record<string, Promise<TileDocument>>
  definitions: Record<string, Promise<CreatedDoc>>
  schemas: Record<string, Promise<CreatedDoc>>
  schemaAliases: Record<string, string> // Stream ID to alias
  tiles: Record<string, Promise<CreatedDoc>>
}

export function getReference(schema: Schema): Array<string> | null {
  if (schema.$comment?.startsWith(CIP88_REF_PREFIX)) {
    const schemasString = schema.$comment.substr(CIP88_REF_PREFIX.length)
    if (schemasString.length) {
      const schemas = schemasString.split('|')
      schemas.sort()
      return schemas
    }
  }
  return null
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
    // TODO: extract collection slice schema URL
    return Object.values(schema.properties as Record<string, Schema>).flatMap(
      extractSchemaReferences
    )
  }
  return []
}

// Publish a signed model to the given Ceramic node
export async function publishSignedModel(
  ceramic: CeramicApi,
  signed: SignedModel
): Promise<PublishedModel> {
  const schemas = await promiseMap(signed.schemas, async (commits) => {
    const doc = await publishCommits(ceramic, commits)
    return doc.commitId.toUrl()
  })
  const [definitions, tiles] = await Promise.all([
    promiseMap(signed.definitions, async (commits) => {
      const doc = await publishCommits(ceramic, commits)
      return doc.id.toString()
    }),
    promiseMap(signed.tiles, async (commits) => {
      const doc = await publishCommits(ceramic, commits)
      return doc.id.toString()
    }),
  ])
  return { definitions, schemas, tiles }
}

// Publish a JSON-encoded signed docset to the given Ceramic node
export async function publishEncodedSignedModel(
  ceramic: CeramicApi,
  model: EncodedSignedModel
): Promise<PublishedModel> {
  return await publishSignedModel(ceramic, applyMap(model, decodeSignedMap))
}

export async function publishCoreModel(ceramic: CeramicApi): Promise<CoreModel> {
  return (await publishEncodedSignedModel(ceramic, coreModel)) as CoreModel
}
export class ModelManager {
  public static fromPublished(ceramic: CeramicApi, published: PublishedModel): ModelManager {
    const model: ManagedModel = {
      docs: {},
      definitions: {},
      schemas: {},
      schemaAliases: {},
      tiles: {},
    }
    for (const [alias, url] of Object.entries(published.schemas)) {
      model.schemas[alias] = Promise.resolve({ id: CommitID.fromString(url), dependencies: [] })
      model.schemaAliases[url] = alias
    }
    for (const [alias, id] of Object.entries(published.definitions)) {
      model.definitions[alias] = Promise.resolve({ id: StreamID.fromString(id), dependencies: [] })
    }
    for (const [alias, id] of Object.entries(published.tiles)) {
      model.tiles[alias] = Promise.resolve({ id: StreamID.fromString(id), dependencies: [] })
    }
    return new ModelManager(ceramic, model)
  }

  public static async fromSigned(ceramic: CeramicApi, signed: SignedModel): Promise<ModelManager> {
    const published = await publishSignedModel(ceramic, signed)
    return ModelManager.fromPublished(ceramic, published)
  }

  public static async fromSignedJSON(
    ceramic: CeramicApi,
    encoded: EncodedSignedModel
  ): Promise<ModelManager> {
    const signed = applyMap(encoded, decodeSignedMap)
    return await ModelManager.fromSigned(ceramic, signed)
  }

  _ceramic: CeramicApi
  _model: ManagedModel

  constructor(
    ceramic: CeramicApi,
    model: ManagedModel = {
      docs: {},
      definitions: {},
      schemas: {},
      schemaAliases: {},
      tiles: {},
    }
  ) {
    if (ceramic.did == null || !ceramic.did.authenticated) {
      throw new Error('Ceramic instance must be authenticated')
    }
    this._ceramic = ceramic
    this._model = model
  }

  get definitions(): Array<string> {
    return Object.keys(this._model.definitions)
  }

  get schemas(): Array<string> {
    return Object.keys(this._model.schemas)
  }

  get tiles(): Array<string> {
    return Object.keys(this._model.tiles)
  }

  // Loaders

  async loadCreated(created: Promise<CreatedDoc>): Promise<TileDocument> {
    return await this.loadDoc((await created).id)
  }

  async loadDoc(streamID: StreamRef | string): Promise<TileDocument> {
    const id = streamIDToString(streamID)
    if (this._model.docs[id] == null) {
      this._model.docs[id] = TileDocument.load(this._ceramic, id)
    }
    return await this._model.docs[id]
  }

  async loadSchema(id: StreamRef | string, alias?: string): Promise<StreamRef> {
    const existingAlias = this._model.schemaAliases[streamIDToString(id)]
    if (existingAlias != null) {
      const existing = this._model.schemas[existingAlias]
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
    this._model.schemas[name] = Promise.all(
      Array.from(schemaRefs).map(async (id) => await this.loadSchema(id))
    ).then(
      (dependencies) => {
        this._model.schemaAliases[doc.commitId.toUrl()] = name
        return { id: doc.commitId, dependencies }
      },
      (reason: any) => {
        delete this._model.schemas[name]
        throw reason
      }
    )

    return doc.commitId
  }

  async useCoreModel(): Promise<void> {
    const { schemas } = await publishCoreModel(this._ceramic)
    await Promise.all([
      this.usePublishedSchema('Definition', schemas.Definition),
      this.usePublishedSchema('IdentityIndex', schemas.IdentityIndex),
    ])
  }

  // Schemas

  hasSchema(alias: string): boolean {
    return this._model.schemas[alias] != null
  }

  getSchema(alias: string): Promise<CreatedDoc> | null {
    return this._model.schemas[alias] ?? null
  }

  deleteSchema(alias: string): boolean {
    if (this.hasSchema(alias)) {
      delete this._model.schemas[alias]
      return true
    }
    return false
  }

  createSchema(
    alias: string,
    schema: Schema,
    deps: Array<Promise<StreamRef>> = []
  ): Promise<CreatedDoc> {
    if (this.hasSchema(alias)) {
      throw new Error(`Schema ${alias} already exists`)
    }

    this._model.schemas[alias] = Promise.all(deps).then((dependencies) => {
      return createTile(this._ceramic, schema).then(
        (doc) => {
          this._model.schemaAliases[doc.commitId.toUrl()] = alias
          return { id: doc.commitId, dependencies }
        },
        (reason: any) => {
          delete this._model.schemas[alias]
          throw reason
        }
      )
    })
    return this._model.schemas[alias]
  }

  async addSchema(alias: string, schema: Schema): Promise<StreamRef> {
    if (alias == null) {
      throw new Error('Schema alias must be provided')
    }

    const schemaRefs = new Set(extractSchemaReferences(schema))
    const deps = Array.from(schemaRefs).map(async (id) => await this.loadSchema(id))

    const created = await this.createSchema(alias, schema, deps)
    return created.id
  }

  async usePublishedSchema(alias: string, id: StreamRef | string): Promise<StreamRef> {
    if (alias == null) {
      throw new Error('Schema alias must be provided')
    }
    return await this.loadSchema(id, alias)
  }

  hasDefinition(alias: string): boolean {
    return this._model.definitions[alias] != null
  }

  getDefinition(alias: string): Promise<CreatedDoc> | null {
    return this._model.definitions[alias] ?? null
  }

  deleteDefinition(alias: string): boolean {
    if (this.hasDefinition(alias)) {
      delete this._model.definitions[alias]
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

    if (!this.hasSchema('IdentityIndex')) {
      throw new Error('Missing IdentityIndex schema in model, call useCoreModel() first')
    }
    const definitionSchemaCreated = this.getSchema('Definition')
    if (definitionSchemaCreated == null) {
      throw new Error('Missing Definition schema in model, call useCoreModel() first')
    }

    this._model.definitions[alias] = Promise.all([
      definitionSchemaCreated.then((doc) => doc.id),
      ...deps,
    ]).then((dependencies) => {
      return createTile(this._ceramic, definition, { schema: dependencies[0].toUrl() }).then(
        (doc) => ({ id: doc.id, dependencies }),
        (reason: any) => {
          delete this._model.definitions[alias]
          throw reason
        }
      )
    })
    return this._model.definitions[alias]
  }

  async addDefinition(alias: string, definition: Definition): Promise<StreamRef> {
    const created = await this.createDefinition(alias, definition, [
      this.loadSchema(definition.schema),
    ])
    return created.id
  }

  async usePublishedDefinition(alias: string, id: StreamID | string): Promise<StreamRef> {
    if (this.hasDefinition(alias)) {
      throw new Error(`Definition ${alias} already exists`)
    }

    const added = this.loadDoc(id).then((doc) => {
      return this.loadSchema(doc.content.schemaURL).then(
        (schemaRef) => ({ id: doc.id, dependencies: [schemaRef] }),
        (reason: any) => {
          delete this._model.definitions[alias]
          throw reason
        }
      )
    })

    this._model.definitions[alias] = added
    return (await added).id
  }

  hasTile(alias: string): boolean {
    return this._model.tiles[alias] != null
  }

  getTile(alias: string): Promise<CreatedDoc> | null {
    return this._model.tiles[alias] ?? null
  }

  deleteTile(alias: string): boolean {
    if (this.hasTile(alias)) {
      delete this._model.tiles[alias]
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

    this._model.tiles[alias] = Promise.all(deps).then((dependencies) => {
      return createTile(this._ceramic, contents, meta).then(
        (doc) => ({ id: doc.id, dependencies }),
        (reason: any) => {
          delete this._model.tiles[alias]
          throw reason
        }
      )
    })
    return this._model.tiles[alias]
  }

  async addTile<T extends Record<string, unknown>>(
    alias: string,
    contents: T,
    meta: Partial<StreamMetadata>
  ): Promise<StreamRef> {
    if (meta.schema == null) {
      throw new Error('Missing schema to add tile')
    }
    const created = await this.createTile(alias, contents, meta, [this.loadSchema(meta.schema)])
    return created.id
  }

  async usePublishedTile(alias: string, id: StreamID | string): Promise<StreamRef> {
    if (this.hasTile(alias)) {
      throw new Error(`Tile ${alias} already exists`)
    }

    const added = this.loadDoc(id).then((doc) => {
      return doc.metadata.schema
        ? this.loadSchema(doc.metadata.schema).then(
            (schemaRef) => ({ id: doc.id, dependencies: [schemaRef] }),
            (reason: any) => {
              delete this._model.tiles[alias]
              throw reason
            }
          )
        : { id: doc.id, dependencies: [] }
    })

    this._model.tiles[alias] = added
    return (await added).id
  }

  async toPublished(): Promise<PublishedModel> {
    const signed = await this.toSigned()
    return await publishSignedModel(this._ceramic, signed)
  }

  // Export to maps of aliases to signed commits, would allow to publish a docset on a Ceramic node
  async toSigned(): Promise<SignedModel> {
    const added = new Set<string>()
    const deps = new Set<string>()

    const addDoc = async (created: Promise<CreatedDoc>) => {
      const { id, dependencies } = await created
      dependencies.forEach((depid) => {
        deps.add(depid.toString())
      })
      const streamid = id.baseID
      const commits = await this._ceramic.loadStreamCommits(streamid)
      added.add(id.toString())
      return commits.map((r) => r.value as DagJWSResult)
    }

    const addDefinitions = promiseMap(this._model.definitions, addDoc)
    const addSchemas = promiseMap(this._model.schemas, addDoc)
    const addTiles = promiseMap(this._model.tiles, addDoc)
    const [definitions, schemas, tiles] = await Promise.all([addDefinitions, addSchemas, addTiles])

    for (const id of deps) {
      if (!added.has(id)) {
        throw new Error(`Missing dependency: ${id}`)
      }
    }

    return { definitions, schemas, tiles }
  }

  // Export signed commits to JSON
  async toSignedJSON(): Promise<EncodedSignedModel> {
    const signed = await this.toSigned()
    return applyMap(signed, encodeSignedMap)
  }
}
