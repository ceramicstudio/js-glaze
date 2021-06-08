import type { CeramicApi } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { CommitID, StreamID } from '@ceramicnetwork/streamid'
import { AppendCollection } from '@ceramicstudio/append-collection'
import { IDX } from '@ceramicstudio/idx'
import type { Connection, ConnectionArguments } from 'graphql-relay'

import { toConnection } from './utils'

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

  async loadConnection<Item = unknown>(
    id: string,
    args: ConnectionArguments
  ): Promise<Connection<Item>> {
    const collection = await this.loadCollection<Item>(id)
    let res
    if (args.first) {
      res = await collection.first(args.first, args.after)
    } else if (args.last) {
      res = await collection.last(args.last, args.before)
    } else {
      throw new Error('Invalid connection arguments')
    }
    return toConnection(args, res)
  }

  async loadDoc<Content = Record<string, any>>(
    id: string | CommitID | StreamID
  ): Promise<TileDocument<Content>> {
    return await TileDocument.load<Content>(this._ceramic, id)
  }

  async createDoc<Content = Record<string, any>>(
    schema: string,
    content: Content
  ): Promise<TileDocument<Content>> {
    return await await TileDocument.create<Content>(this._ceramic, content, { schema })
  }
}
