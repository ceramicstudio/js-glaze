import type { CeramicApi } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { CommitID, StreamID } from '@ceramicnetwork/streamid'
import { AppendCollection } from '@ceramicstudio/append-collection'
import type { Cursor, ItemResult, LoadResult } from '@ceramicstudio/append-collection'
import { IDX } from '@ceramicstudio/idx'
import type { Connection, ConnectionArguments } from 'graphql-relay'

import type { Doc } from './types'
import { toConnection, toDoc } from './utils'

export class Context {
  _ceramic: CeramicApi
  _idx: IDX
  _collections: Record<string, Promise<AppendCollection<unknown>>> = {}

  constructor(ceramic: CeramicApi) {
    this._ceramic = ceramic
    this._idx = new IDX({ ceramic })
  }

  get ceramic(): CeramicApi {
    return this._ceramic
  }

  get idx(): IDX {
    return this._idx
  }

  async loadCollection<Item = unknown>(id: string): Promise<AppendCollection<Item>> {
    if (this._collections[id] == null) {
      this._collections[id] = AppendCollection.load<Item>(this._ceramic, id)
    }
    return (await this._collections[id]) as AppendCollection<Item>
  }

  async addToCollection<Item = unknown>(id: string, item: Item): Promise<Cursor> {
    const collection = await this.loadCollection<Item>(id)
    return await collection.add(item)
  }

  async loadConnection<Item = unknown>(
    id: string,
    args: ConnectionArguments,
    loadReferences: boolean = false
  ): Promise<Connection<Item>> {
    const collection = await this.loadCollection<any>(id)
    let res
    if (args.first) {
      res = await collection.first(args.first, args.after)
    } else if (args.last) {
      res = await collection.last(args.last, args.before)
    } else {
      throw new Error('Invalid connection arguments')
    }
    if (loadReferences) {
      res = await this.loadConnectionReferences<Item>(res)
    }
    return toConnection(args, res)
  }

  async loadConnectionReferences<Item>(res: LoadResult<string>): Promise<LoadResult<Item>> {
    const items = await Promise.all(
      res.items.map(async ({ cursor, data }) => {
        const doc = await this.loadDoc(data)
        return { cursor, data: doc.content } as ItemResult<Item>
      })
    )
    return { items, hasMore: res.hasMore }
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
