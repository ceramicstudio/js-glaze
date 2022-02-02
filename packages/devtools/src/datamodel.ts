/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import type { CeramicApi, StreamMetadata } from '@ceramicnetwork/common'
import { CommitID, StreamID, StreamRef } from '@ceramicnetwork/streamid'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { CIP11_DEFINITION_SCHEMA_URL } from '@glazed/constants'
import type { Definition } from '@glazed/did-datastore-model'
import { model as encodedDataStoreModel } from '@glazed/did-datastore-model'
import type {
  EncodedManagedModel,
  ManagedEntry,
  ManagedID,
  ManagedModel,
  ManagedSchema,
  ModelData,
  PublishedModel,
  Schema,
} from '@glazed/types'
import type { DagJWSResult } from 'dids'

import { decodeModel, encodeModel } from './encoding'
import { createModelDoc, publishCommits } from './publishing'
import { extractSchemaReferences } from './schema'

type ManagedReferenced = {
  definitions: Set<ManagedID>
  schemas: Set<ManagedID>
  tiles: Set<ManagedID>
}

type CreateContentType = {
  definition: Definition
  schema: Schema
  tile: Record<string, unknown>
}

type UsePublishedIDType = {
  definition: StreamID | string
  schema: StreamRef | string
  tile: StreamID | string
}

function getManagedIDAndVersion(id: StreamRef | string): [ManagedID, string | null] {
  const streamID = typeof id === 'string' ? StreamRef.from(id) : id
  return [streamID.baseID.toString(), CommitID.isInstance(streamID) ? streamID.toString() : null]
}

function getManagedID(id: StreamRef | string): ManagedID {
  const streamID = typeof id === 'string' ? StreamRef.from(id) : id
  return streamID.baseID.toString()
}

function isSupportedDID(did: string): boolean {
  return did.startsWith('did:key')
}

function docHasSupportedDID(doc: TileDocument<any>): boolean {
  return isSupportedDID(doc.metadata.controllers[0])
}

const dataStoreModel = decodeModel(encodedDataStoreModel)
/** @internal */
export async function publishDataStoreSchemas(ceramic: CeramicApi): Promise<void> {
  await Promise.all(
    Object.values(dataStoreModel.schemas).map(async (schema) => {
      return await publishCommits(ceramic, schema.commits)
    })
  )
}

// Publish a managed model to the given Ceramic node
export async function publishModel(
  ceramic: CeramicApi,
  model: ManagedModel
): Promise<PublishedModel> {
  const [schemas] = await Promise.all([
    Promise.all(
      Object.values(model.schemas).map(async (schema) => {
        const stream = await publishCommits(ceramic, schema.commits)
        return [schema.alias, stream.commitId.toUrl()]
      })
    ),
    publishDataStoreSchemas(ceramic),
  ])
  const [definitions, tiles] = await Promise.all([
    await Promise.all(
      Object.values(model.definitions).map(async (entry) => {
        const stream = await publishCommits(ceramic, entry.commits)
        return [entry.alias, stream.id.toString()]
      })
    ),
    await Promise.all(
      Object.values(model.tiles).map(async (entry) => {
        const stream = await publishCommits(ceramic, entry.commits)
        return [entry.alias, stream.id.toString()]
      })
    ),
  ])
  return {
    definitions: Object.fromEntries(definitions),
    schemas: Object.fromEntries(schemas),
    tiles: Object.fromEntries(tiles),
  }
}

// Publish a JSON-encoded managed model to the given Ceramic node
export async function publishEncodedModel(
  ceramic: CeramicApi,
  model: EncodedManagedModel
): Promise<PublishedModel> {
  return await publishModel(ceramic, decodeModel(model))
}

/**
 * ```sh
 * import { ModelManager } from '@glazed/devtools'
 * ```
 */
export class ModelManager {
  public static fromJSON(ceramic: CeramicApi, encoded: EncodedManagedModel): ModelManager {
    return new ModelManager(ceramic, decodeModel(encoded))
  }

  #aliases: ModelData<string> = {
    definitions: {},
    schemas: {},
    tiles: {},
  }
  #ceramic: CeramicApi
  #model: ManagedModel = {
    definitions: {},
    schemas: {},
    tiles: {},
  }
  #referenced: Record<ManagedID, ManagedReferenced> = {}
  #streams: Record<ManagedID, Promise<TileDocument>> = {}

  constructor(ceramic: CeramicApi, model?: ManagedModel) {
    this.#ceramic = ceramic
    if (model != null) {
      this.addModel(model)
    }
  }

  // Getters

  get model(): ManagedModel {
    return this.#model
  }

  get schemas(): Array<string> {
    return Object.keys(this.#aliases.schemas).sort()
  }

  get definitions(): Array<string> {
    return Object.keys(this.#aliases.definitions).sort()
  }

  get tiles(): Array<string> {
    return Object.keys(this.#aliases.tiles).sort()
  }

  // Imports

  addModel(model: ManagedModel): void {
    Object.assign(this.#model.definitions, model.definitions)
    Object.assign(this.#model.schemas, model.schemas)
    Object.assign(this.#model.tiles, model.tiles)

    for (const [id, schema] of Object.entries(model.schemas)) {
      this.#aliases.schemas[schema.alias] = id
      for (const refIDs of Object.values(schema.dependencies)) {
        for (const refID of refIDs) {
          if (this.#referenced[refID] == null) {
            this.#referenced[refID] = {
              definitions: new Set<ManagedID>(),
              schemas: new Set<ManagedID>(),
              tiles: new Set<ManagedID>(),
            }
          }
          this.#referenced[refID].schemas.add(id)
        }
      }
    }
    for (const [id, definition] of Object.entries(model.definitions)) {
      this.#aliases.definitions[definition.alias] = id
      if (this.#referenced[definition.schema] == null) {
        this.#referenced[definition.schema] = {
          definitions: new Set<ManagedID>(),
          schemas: new Set<ManagedID>(),
          tiles: new Set<ManagedID>(),
        }
      }
      this.#referenced[definition.schema].definitions.add(id)
    }
    for (const [id, tile] of Object.entries(model.tiles)) {
      this.#aliases.tiles[tile.alias] = id
      if (this.#referenced[tile.schema] == null) {
        this.#referenced[tile.schema] = {
          definitions: new Set<ManagedID>(),
          schemas: new Set<ManagedID>(),
          tiles: new Set<ManagedID>(),
        }
      }
      this.#referenced[tile.schema].tiles.add(id)
    }
  }

  addJSONModel(encoded: EncodedManagedModel): void {
    this.addModel(decodeModel(encoded))
  }

  // Loaders

  async loadStream(streamID: StreamRef | string): Promise<TileDocument> {
    const id = typeof streamID === 'string' ? streamID : streamID.baseID.toString()
    if (this.#streams[id] == null) {
      this.#streams[id] = this._loadAndValidateStream(id)
    }
    return await this.#streams[id]
  }

  /** @internal */
  async _loadAndValidateStream(id: string): Promise<TileDocument> {
    const stream = await TileDocument.load<Record<string, any>>(this.#ceramic, id)
    if (stream.anchorCommitIds.length !== 0) {
      throw new Error(`Invalid stream ${id}: contains anchor commit`)
    }

    // Shortcut logic for single commit
    if (stream.allCommitIds.length === 1 && docHasSupportedDID(stream)) {
      return stream
    }

    const commits = await Promise.all(
      stream.allCommitIds.map(async (commitID) => {
        return await TileDocument.load(this.#ceramic, commitID)
      })
    )
    const unsupported = commits.find((commit) => !docHasSupportedDID(commit))
    if (unsupported != null) {
      throw new Error(`Invalid stream ${id}: contains a commit authored by an unsupported DID`)
    }

    return stream
  }

  async loadCommits(id: ManagedID): Promise<Array<DagJWSResult>> {
    const commits = await this.#ceramic.loadStreamCommits(id)
    return commits.map((r) => r.value as DagJWSResult)
  }

  async loadSchema(id: StreamRef | string, alias?: string): Promise<ManagedID> {
    const [managedID, commitID] = getManagedIDAndVersion(id)
    if (commitID === null) {
      throw new Error(`Expected CommitID to load schema: ${managedID}`)
    }

    const existing = this.#model.schemas[managedID]
    if (existing != null) {
      if (existing.version !== commitID) {
        throw new Error(`Another version for this schema is already set: ${existing.version}`)
      }
      if (alias != null && existing.alias !== alias) {
        throw new Error(`Another alias for this schema is already set: ${existing.alias}`)
      }
      return managedID
    }

    const [stream, commits] = await Promise.all([
      this.loadStream(commitID),
      this.loadCommits(managedID),
    ])
    const content = (stream.content ?? {}) as Schema
    const name = alias ?? content.title
    if (name == null) {
      throw new Error('Schema must have a title property or an alias must be provided')
    }

    const dependencies = await this.loadSchemaDependencies(content)
    this.#model.schemas[managedID] = { alias: name, commits, dependencies, version: commitID }
    this.#aliases.schemas[name] = managedID

    return managedID
  }

  async loadSchemaDependencies(schema: Schema): Promise<Record<string, Array<string>>> {
    const references = extractSchemaReferences(schema)

    const ids = new Set<string>()
    for (const refs of Object.values(references)) {
      for (const ref of refs) {
        ids.add(ref)
      }
    }
    const loaded = await Promise.all(
      Array.from(ids).map(async (id) => [id, await this.loadSchema(id)])
    )
    const idToManaged: Record<string, string> = Object.fromEntries(loaded)

    return Object.entries(references).reduce((acc, [path, deps]) => {
      acc[path] = deps.map((id) => idToManaged[id])
      return acc
    }, {} as Record<string, Array<string>>)
  }

  // High-level

  async create<T extends keyof CreateContentType, Content = CreateContentType[T]>(
    type: T,
    alias: string,
    content: Content,
    meta?: Partial<StreamMetadata>
  ): Promise<ManagedID> {
    switch (type) {
      case 'schema':
        return await this.createSchema(alias, content as any)
      case 'definition':
        return await this.createDefinition(alias, content as any)
      case 'tile':
        return await this.createTile(alias, content as any, meta)
      default:
        throw new Error(`Unsupported type: ${type as string}`)
    }
  }

  async usePublished<T extends keyof UsePublishedIDType, ID = UsePublishedIDType[T]>(
    type: T,
    alias: string,
    id: ID
  ): Promise<ManagedID> {
    switch (type) {
      case 'schema':
        return await this.usePublishedSchema(alias, id as any)
      case 'definition':
        return await this.usePublishedDefinition(alias, id as any)
      case 'tile':
        return await this.usePublishedTile(alias, id as any)
      default:
        throw new Error(`Unsupported type: ${type as string}`)
    }
  }

  // Schemas

  getSchemaID(alias: string): ManagedID | null {
    return this.#aliases.schemas[alias] ?? null
  }

  hasSchemaAlias(alias: string): boolean {
    return this.getSchemaID(alias) != null
  }

  getSchema(id: ManagedID): ManagedSchema | null {
    return this.#model.schemas[id] ?? null
  }

  getSchemaURL(id: ManagedID): string | null {
    const schema = this.#model.schemas[id]
    return schema ? CommitID.fromString(schema.version).toUrl() : null
  }

  getSchemaByAlias(alias: string): ManagedSchema | null {
    const id = this.getSchemaID(alias)
    return id ? this.getSchema(id) : null
  }

  async createSchema(alias: string, schema: Schema): Promise<ManagedID> {
    if (this.#ceramic.did == null || !this.#ceramic.did.authenticated) {
      throw new Error('Ceramic instance must be authenticated')
    }
    if (!isSupportedDID(this.#ceramic.did.id)) {
      throw new Error(
        `Invalid DID ${
          this.#ceramic.did.id
        } to create stream for model, only "did:key" is supported`
      )
    }
    if (this.hasSchemaAlias(alias)) {
      throw new Error(`Schema ${alias} already exists`)
    }

    const [stream, dependencies] = await Promise.all([
      createModelDoc(this.#ceramic, schema),
      this.loadSchemaDependencies(schema),
    ])

    const id = stream.id.toString()
    this.#model.schemas[id] = {
      alias,
      commits: await this.loadCommits(id),
      dependencies,
      version: stream.commitId.toString(),
    }
    this.#aliases.schemas[alias] = id

    return id
  }

  async usePublishedSchema(alias: string, id: StreamRef | string): Promise<ManagedID> {
    if (alias == null) {
      throw new Error('Schema alias must be provided')
    }
    return await this.loadSchema(id, alias)
  }

  // Definitions

  getDefinitionID(alias: string): ManagedID | null {
    return this.#aliases.definitions[alias] ?? null
  }

  hasDefinitionAlias(alias: string): boolean {
    return this.getDefinitionID(alias) != null
  }

  getDefinition(id: ManagedID): ManagedEntry | null {
    return this.#model.definitions[id] ?? null
  }

  async createDefinition(alias: string, definition: Definition): Promise<ManagedID> {
    if (this.#ceramic.did == null || !this.#ceramic.did.authenticated) {
      throw new Error('Ceramic instance must be authenticated')
    }
    if (!isSupportedDID(this.#ceramic.did.id)) {
      throw new Error(
        `Invalid DID ${
          this.#ceramic.did.id
        } to create stream for model, only "did:key" is supported`
      )
    }
    if (this.hasDefinitionAlias(alias)) {
      throw new Error(`Definition ${alias} already exists`)
    }

    await publishDataStoreSchemas(this.#ceramic)
    const [stream, schemaID] = await Promise.all([
      createModelDoc(this.#ceramic, definition, { schema: CIP11_DEFINITION_SCHEMA_URL }),
      this.loadSchema(definition.schema),
    ])

    const id = stream.id.toString()
    this.#model.definitions[id] = {
      alias,
      commits: await this.loadCommits(id),
      schema: schemaID,
      version: stream.commitId.toString(),
    }
    this.#aliases.definitions[alias] = id

    return id
  }

  async usePublishedDefinition(alias: string, id: StreamID | string): Promise<ManagedID> {
    if (this.hasDefinitionAlias(alias)) {
      throw new Error(`Definition ${alias} already exists`)
    }

    const definitionID = getManagedID(id)
    const [stream, commits] = await Promise.all([
      this.loadStream(id),
      this.loadCommits(definitionID),
    ])

    this.#model.definitions[definitionID] = {
      alias,
      commits,
      schema: await this.loadSchema((stream.content as Definition).schema),
      version: stream.commitId.toString(),
    }
    this.#aliases.definitions[alias] = definitionID

    return definitionID
  }

  // Tiles

  getTileID(alias: string): ManagedID | null {
    return this.#aliases.tiles[alias] ?? null
  }

  hasTileAlias(alias: string): boolean {
    return this.getTileID(alias) != null
  }

  getTile(id: ManagedID): ManagedEntry | null {
    return this.#model.tiles[id] ?? null
  }

  async createTile<T extends Record<string, unknown>>(
    alias: string,
    contents: T,
    meta: Partial<StreamMetadata> = {}
  ): Promise<ManagedID> {
    if (this.#ceramic.did == null || !this.#ceramic.did.authenticated) {
      throw new Error('Ceramic instance must be authenticated')
    }
    if (!isSupportedDID(this.#ceramic.did.id)) {
      throw new Error('Unsupported DID to create stream for model')
    }
    if (this.hasTileAlias(alias)) {
      throw new Error(`Tile ${alias} already exists`)
    }
    if (meta.schema == null) {
      throw new Error(`Missing schema to create tile ${alias}`)
    }

    const [stream, schemaID] = await Promise.all([
      createModelDoc(this.#ceramic, contents, meta),
      this.loadSchema(meta.schema),
    ])

    const id = stream.id.toString()
    this.#model.tiles[id] = {
      alias,
      commits: await this.loadCommits(id),
      schema: schemaID,
      version: stream.commitId.toString(),
    }
    this.#aliases.tiles[alias] = id

    return id
  }

  async usePublishedTile(alias: string, id: StreamID | string): Promise<ManagedID> {
    if (this.hasTileAlias(alias)) {
      throw new Error(`Tile ${alias} already exists`)
    }

    const tileID = getManagedID(id)
    const [stream, commits] = await Promise.all([this.loadStream(id), this.loadCommits(tileID)])
    if (stream.metadata.schema == null) {
      throw new Error('Loaded tile has no schema defined')
    }

    this.#model.tiles[tileID] = {
      alias,
      commits,
      schema: await this.loadSchema(stream.metadata.schema),
      version: stream.commitId.toString(),
    }
    this.#aliases.tiles[alias] = tileID

    return tileID
  }

  // Exports

  async toPublished(): Promise<PublishedModel> {
    return await publishModel(this.#ceramic, this.#model)
  }

  toJSON(): EncodedManagedModel {
    return encodeModel(this.#model)
  }
}
