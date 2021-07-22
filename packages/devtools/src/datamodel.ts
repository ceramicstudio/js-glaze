/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import type { CeramicApi, StreamMetadata } from '@ceramicnetwork/common'
import { CommitID, StreamID, StreamRef } from '@ceramicnetwork/streamid'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { Definition } from '@glazed/did-datastore-model'
import { model as dataStoreModel } from '@glazed/did-datastore-model'
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
import { createTile, publishCommits } from './publishing'
import { extractSchemaReferences } from './schema'

type ManagedReferenced = {
  definitions: Set<ManagedID>
  schemas: Set<ManagedID>
  tiles: Set<ManagedID>
}

type DataStoreModel = {
  definitions: Record<string, never>
  schemas: {
    DataStoreDefinition: string
    DataStoreIdentityIndex: string
  }
  tiles: Record<string, never>
}

function getManagedIDAndVersion(id: StreamRef | string): [ManagedID, string | null] {
  const streamID = typeof id === 'string' ? StreamRef.from(id) : id
  return [streamID.baseID.toString(), CommitID.isInstance(streamID) ? streamID.toString() : null]
}

function getManagedID(id: StreamRef | string): ManagedID {
  const streamID = typeof id === 'string' ? StreamRef.from(id) : id
  return streamID.baseID.toString()
}

// Publish a managed model to the given Ceramic node
export async function publishModel(
  ceramic: CeramicApi,
  model: ManagedModel
): Promise<PublishedModel> {
  const schemas = await Promise.all(
    Object.values(model.schemas).map(async (schema) => {
      const stream = await publishCommits(ceramic, schema.commits)
      return [schema.alias, stream.commitId.toUrl()]
    })
  )
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

export async function publishDataStoreModel(ceramic: CeramicApi): Promise<DataStoreModel> {
  return (await publishEncodedModel(ceramic, dataStoreModel)) as DataStoreModel
}
export class ModelManager {
  public static fromJSON(ceramic: CeramicApi, encoded: EncodedManagedModel): ModelManager {
    return new ModelManager(ceramic, decodeModel(encoded))
  }

  _aliases: ModelData<string> = {
    definitions: {},
    schemas: {},
    tiles: {},
  }
  _ceramic: CeramicApi
  _model: ManagedModel
  _referenced: Record<ManagedID, ManagedReferenced> = {}
  _streams: Record<ManagedID, Promise<TileDocument>> = {}

  constructor(
    ceramic: CeramicApi,
    model: ManagedModel = {
      definitions: {},
      schemas: {},
      tiles: {},
    }
  ) {
    if (ceramic.did == null || !ceramic.did.authenticated) {
      throw new Error('Ceramic instance must be authenticated')
    }
    this._ceramic = ceramic
    this._model = model

    for (const [id, schema] of Object.entries(model.schemas)) {
      this._aliases.schemas[schema.alias] = id
      for (const refIDs of Object.values(schema.dependencies)) {
        for (const refID of refIDs) {
          if (this._referenced[refID] == null) {
            this._referenced[refID] = {
              definitions: new Set<ManagedID>(),
              schemas: new Set<ManagedID>(),
              tiles: new Set<ManagedID>(),
            }
          }
          this._referenced[refID].schemas.add(id)
        }
      }
    }
    for (const [id, definition] of Object.entries(model.definitions)) {
      this._aliases.definitions[definition.alias] = id
      if (this._referenced[definition.schema] == null) {
        this._referenced[definition.schema] = {
          definitions: new Set<ManagedID>(),
          schemas: new Set<ManagedID>(),
          tiles: new Set<ManagedID>(),
        }
      }
      this._referenced[definition.schema].definitions.add(id)
    }
    for (const [id, tile] of Object.entries(model.tiles)) {
      this._aliases.tiles[tile.alias] = id
      if (this._referenced[tile.schema] == null) {
        this._referenced[tile.schema] = {
          definitions: new Set<ManagedID>(),
          schemas: new Set<ManagedID>(),
          tiles: new Set<ManagedID>(),
        }
      }
      this._referenced[tile.schema].tiles.add(id)
    }
  }

  // Getters

  get model(): ManagedModel {
    return this._model
  }

  get schemas(): Array<string> {
    return Object.keys(this._aliases.schemas).sort()
  }

  get definitions(): Array<string> {
    return Object.keys(this._aliases.definitions).sort()
  }

  get tiles(): Array<string> {
    return Object.keys(this._aliases.tiles).sort()
  }

  // Loaders

  async loadStream(streamID: StreamRef | string): Promise<TileDocument> {
    const id = typeof streamID === 'string' ? streamID : streamID.baseID.toString()
    if (this._streams[id] == null) {
      this._streams[id] = TileDocument.load(this._ceramic, id)
    }
    return await this._streams[id]
  }

  async loadCommits(id: ManagedID): Promise<Array<DagJWSResult>> {
    const commits = await this._ceramic.loadStreamCommits(id)
    return commits.map((r) => r.value as DagJWSResult)
  }

  async loadSchema(id: StreamRef | string, alias?: string): Promise<ManagedID> {
    const [managedID, commitID] = getManagedIDAndVersion(id)
    if (commitID === null) {
      throw new Error(`Expected CommitID to load schema: ${managedID}`)
    }

    const existing = this._model.schemas[managedID]
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
    this._model.schemas[managedID] = { alias: name, commits, dependencies, version: commitID }
    this._aliases.schemas[name] = managedID

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

  async useDataStoreModel(): Promise<void> {
    const { schemas } = await publishDataStoreModel(this._ceramic)
    await Promise.all([
      this.usePublishedSchema('DataStoreDefinition', schemas.DataStoreDefinition),
      this.usePublishedSchema('DataStoreIdentityIndex', schemas.DataStoreIdentityIndex),
    ])
  }

  // Schemas

  getSchemaID(alias: string): ManagedID | null {
    return this._aliases.schemas[alias] ?? null
  }

  hasSchemaAlias(alias: string): boolean {
    return this.getSchemaID(alias) != null
  }

  getSchema(id: ManagedID): ManagedSchema | null {
    return this._model.schemas[id] ?? null
  }

  getSchemaURL(id: ManagedID): string | null {
    const schema = this._model.schemas[id]
    return schema ? CommitID.fromString(schema.version).toUrl() : null
  }

  getSchemaByAlias(alias: string): ManagedSchema | null {
    const id = this.getSchemaID(alias)
    return id ? this.getSchema(id) : null
  }

  async createSchema(alias: string, schema: Schema): Promise<ManagedID> {
    if (this.hasSchemaAlias(alias)) {
      throw new Error(`Schema ${alias} already exists`)
    }

    const [stream, dependencies] = await Promise.all([
      createTile(this._ceramic, schema),
      this.loadSchemaDependencies(schema),
    ])

    const id = stream.id.toString()
    this._model.schemas[id] = {
      alias,
      commits: await this.loadCommits(id),
      dependencies,
      version: stream.commitId.toString(),
    }
    this._aliases.schemas[alias] = id

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
    return this._aliases.definitions[alias] ?? null
  }

  hasDefinitionAlias(alias: string): boolean {
    return this.getDefinitionID(alias) != null
  }

  getDefinition(id: ManagedID): ManagedEntry | null {
    return this._model.definitions[id] ?? null
  }

  async createDefinition(alias: string, definition: Definition): Promise<ManagedID> {
    if (this.hasDefinitionAlias(alias)) {
      throw new Error(`Definition ${alias} already exists`)
    }

    if (!this.hasSchemaAlias('DataStoreIdentityIndex')) {
      throw new Error('Missing IdentityIndex schema in model, call useDataStoreModel() first')
    }
    const definitionSchema = this.getSchemaByAlias('DataStoreDefinition')
    if (definitionSchema == null) {
      throw new Error('Missing Definition schema in model, call useDataStoreModel() first')
    }

    const [stream, schemaID] = await Promise.all([
      createTile(this._ceramic, definition, {
        schema: CommitID.fromString(definitionSchema.version).toUrl(),
      }),
      this.loadSchema(definition.schema),
    ])

    const id = stream.id.toString()
    this._model.definitions[id] = {
      alias,
      commits: await this.loadCommits(id),
      schema: schemaID,
      version: stream.commitId.toString(),
    }
    this._aliases.definitions[alias] = id

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

    this._model.definitions[definitionID] = {
      alias,
      commits,
      schema: await this.loadSchema((stream.content as Definition).schema),
      version: stream.commitId.toString(),
    }
    this._aliases.definitions[alias] = definitionID

    return definitionID
  }

  // Tiles

  getTileID(alias: string): ManagedID | null {
    return this._aliases.tiles[alias] ?? null
  }

  hasTileAlias(alias: string): boolean {
    return this.getTileID(alias) != null
  }

  getTile(id: ManagedID): ManagedEntry | null {
    return this._model.tiles[id] ?? null
  }

  async createTile<T extends Record<string, unknown>>(
    alias: string,
    contents: T,
    meta: Partial<StreamMetadata>
  ): Promise<ManagedID> {
    if (this.hasTileAlias(alias)) {
      throw new Error(`Tile ${alias} already exists`)
    }
    if (meta.schema == null) {
      throw new Error(`Missing schema to create tile ${alias}`)
    }

    const [stream, schemaID] = await Promise.all([
      createTile(this._ceramic, contents, meta),
      this.loadSchema(meta.schema),
    ])

    const id = stream.id.toString()
    this._model.tiles[id] = {
      alias,
      commits: await this.loadCommits(id),
      schema: schemaID,
      version: stream.commitId.toString(),
    }
    this._aliases.tiles[alias] = id

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

    this._model.tiles[tileID] = {
      alias,
      commits,
      schema: await this.loadSchema(stream.metadata.schema),
      version: stream.commitId.toString(),
    }
    this._aliases.tiles[alias] = tileID

    return tileID
  }

  // Exports

  async toPublished(): Promise<PublishedModel> {
    return await publishModel(this._ceramic, this._model)
  }

  toJSON(): EncodedManagedModel {
    return encodeModel(this._model)
  }
}
