import type { CeramicApi } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { CommitID, StreamID } from '@ceramicnetwork/streamid'
import { DataModel } from '@glazed/datamodel'
import { DIDDataStore } from '@glazed/did-datastore'
import { TileLoader } from '@glazed/tile-loader'
import type { TileCache } from '@glazed/tile-loader'
import type { ModelTypeAliases, ModelTypesToAliases } from '@glazed/types'

import { ItemConnectionHandler, ReferenceConnectionHandler } from './connection'
import type { Doc } from './types'
import { toDoc } from './utils'

export type ContextConfig<ModelTypes extends ModelTypeAliases = ModelTypeAliases> = {
  cache?: TileCache | boolean
  ceramic: CeramicApi
  loader?: TileLoader
  model: DataModel<ModelTypes> | ModelTypesToAliases<ModelTypes>
}

export class Context<ModelTypes extends ModelTypeAliases = ModelTypeAliases> {
  #ceramic: CeramicApi
  #loader: TileLoader
  #dataStore: DIDDataStore<ModelTypes>
  #itemConnections: Record<string, Promise<ItemConnectionHandler<unknown>>> = {}
  #referenceConnections: Record<string, Promise<ReferenceConnectionHandler<unknown>>> = {}

  constructor(config: ContextConfig<ModelTypes>) {
    const { cache, ceramic, loader, model } = config
    this.#ceramic = ceramic
    this.#loader = loader ?? new TileLoader({ ceramic, cache })
    this.#dataStore = new DIDDataStore<ModelTypes>({
      ceramic,
      loader: this.#loader,
      model:
        model instanceof DataModel
          ? model
          : new DataModel<ModelTypes>({ loader: this.#loader, aliases: model }),
    })
  }

  get ceramic(): CeramicApi {
    return this.#ceramic
  }

  get dataStore(): DIDDataStore<ModelTypes> {
    return this.#dataStore
  }

  get loader(): TileLoader {
    return this.#loader
  }

  async getItemConnection<Node = unknown>(id: string): Promise<ItemConnectionHandler<Node>> {
    if (this.#itemConnections[id] == null) {
      this.#itemConnections[id] = ItemConnectionHandler.load<Node>(this.#loader, id)
    }
    return (await this.#itemConnections[id]) as ItemConnectionHandler<Node>
  }

  async createItemConnection<Node = unknown>(
    schemaURL: string
  ): Promise<ItemConnectionHandler<Node>> {
    const handler = await ItemConnectionHandler.create<Node>(this.#loader, schemaURL)
    this.#itemConnections[handler.id] = Promise.resolve(handler)
    return handler
  }

  async getReferenceConnection<Node = unknown>(
    id: string,
    nodeSchemaURL: string
  ): Promise<ReferenceConnectionHandler<Node>> {
    if (this.#referenceConnections[id] == null) {
      this.#referenceConnections[id] = ReferenceConnectionHandler.load<Node>(
        this.#loader,
        id,
        nodeSchemaURL
      )
    }
    return (await this.#referenceConnections[id]) as ReferenceConnectionHandler<Node>
  }

  async createReferenceConnection<Node = unknown>(
    schemaURL: string,
    nodeSchemaURL: string
  ): Promise<ReferenceConnectionHandler<Node>> {
    const handler = await ReferenceConnectionHandler.create<Node>(
      this.#loader,
      schemaURL,
      nodeSchemaURL
    )
    this.#referenceConnections[handler.id] = Promise.resolve(handler)
    return handler
  }

  async loadTile<Content = Record<string, any>>(
    id: string | CommitID | StreamID
  ): Promise<TileDocument<Content>> {
    return await this.#loader.load<Content>(id)
  }

  async loadDoc<Content = Record<string, any>>(
    id: string | CommitID | StreamID
  ): Promise<Doc<Content>> {
    const tile = await this.loadTile<Content>(id)
    return toDoc(tile)
  }

  async createDoc<Content = Record<string, any>>(
    schema: string,
    content: Content
  ): Promise<Doc<Content>> {
    const tile = await this.#loader.create<Content>(content, { schema })
    return toDoc(tile)
  }

  async updateDoc<Content = Record<string, any>>(
    id: string | CommitID | StreamID,
    content: Content
  ): Promise<Doc<Content>> {
    const tile = await this.loadTile<Content>(id)
    await tile.update(content)
    return toDoc(tile)
  }
}
