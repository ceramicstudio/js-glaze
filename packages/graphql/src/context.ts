import type { CeramicApi } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { CommitID, StreamID } from '@ceramicnetwork/streamid'
import type { DataModel } from '@glazed/datamodel'
import { DIDDataStore } from '@glazed/did-datastore'
import type { ModelTypeAliases, ModelTypesToAliases } from '@glazed/types'

import { ItemConnectionHandler, ReferenceConnectionHandler } from './connection'
import type { Doc } from './types'
import { toDoc } from './utils'

export type ContextConfig<ModelTypes extends ModelTypeAliases = ModelTypeAliases> = {
  autopin?: boolean
  ceramic: CeramicApi
  model: DataModel<ModelTypes> | ModelTypesToAliases<ModelTypes>
}

export class Context<ModelTypes extends ModelTypeAliases = ModelTypeAliases> {
  _ceramic: CeramicApi
  _dataStore: DIDDataStore<ModelTypes>
  _itemConnections: Record<string, Promise<ItemConnectionHandler<unknown>>> = {}
  _referenceConnections: Record<string, Promise<ReferenceConnectionHandler<unknown>>> = {}

  constructor(config: ContextConfig<ModelTypes>) {
    this._ceramic = config.ceramic
    this._dataStore = new DIDDataStore<ModelTypes>(config)
  }

  get ceramic(): CeramicApi {
    return this._ceramic
  }

  get dataStore(): DIDDataStore<ModelTypes> {
    return this._dataStore
  }

  async getItemConnection<Node = unknown>(id: string): Promise<ItemConnectionHandler<Node>> {
    if (this._itemConnections[id] == null) {
      this._itemConnections[id] = ItemConnectionHandler.load<Node>(this._ceramic, id)
    }
    return (await this._itemConnections[id]) as ItemConnectionHandler<Node>
  }

  async createItemConnection<Node = unknown>(
    schemaURL: string
  ): Promise<ItemConnectionHandler<Node>> {
    const handler = await ItemConnectionHandler.create<Node>(this._ceramic, schemaURL)
    this._itemConnections[handler.id] = Promise.resolve(handler)
    return handler
  }

  async getReferenceConnection<Node = unknown>(
    id: string,
    nodeSchemaURL: string
  ): Promise<ReferenceConnectionHandler<Node>> {
    if (this._referenceConnections[id] == null) {
      this._referenceConnections[id] = ReferenceConnectionHandler.load<Node>(
        this._ceramic,
        id,
        nodeSchemaURL
      )
    }
    return (await this._referenceConnections[id]) as ReferenceConnectionHandler<Node>
  }

  async createReferenceConnection<Node = unknown>(
    schemaURL: string,
    nodeSchemaURL: string
  ): Promise<ReferenceConnectionHandler<Node>> {
    const handler = await ReferenceConnectionHandler.create<Node>(
      this._ceramic,
      schemaURL,
      nodeSchemaURL
    )
    this._referenceConnections[handler.id] = Promise.resolve(handler)
    return handler
  }

  async loadTile<Content = Record<string, any>>(
    id: string | CommitID | StreamID
  ): Promise<TileDocument<Content>> {
    return await TileDocument.load<Content>(this._ceramic, id)
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
    const tile = await TileDocument.create<Content>(this._ceramic, content, { schema })
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
