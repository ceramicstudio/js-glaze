import type { CeramicApi } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { AppendCollection } from '@glazed/append-collection'
import type { ItemResult, LoadResult } from '@glazed/append-collection'
import type { Connection, ConnectionArguments, Edge } from 'graphql-relay'

import type { Doc } from './types'
import { toDoc } from './utils'

export function toConnection<T>(args: ConnectionArguments, result: LoadResult<T>): Connection<T> {
  const edges = result.items.map((item) => ({
    cursor: item.cursor.toString(),
    node: item.data,
  }))

  const firstCursor = edges[0]?.cursor
  const lastCursor = edges[edges.length - 1]?.cursor
  const pageInfo = args.first
    ? {
        startCursor: firstCursor,
        endCursor: lastCursor,
        hasNextPage: result.hasMore,
        hasPreviousPage: args.after != null,
      }
    : {
        startCursor: lastCursor,
        endCursor: firstCursor,
        hasNextPage: args.before != null,
        hasPreviousPage: result.hasMore,
      }

  return { edges, pageInfo }
}

export class ItemConnectionHandler<Node> {
  static async create<Node>(
    ceramic: CeramicApi,
    schemaURL: string
  ): Promise<ItemConnectionHandler<Node>> {
    const collection = await AppendCollection.create<Node>(ceramic, schemaURL)
    return new ItemConnectionHandler(collection)
  }

  static async load<Node>(ceramic: CeramicApi, id: string): Promise<ItemConnectionHandler<Node>> {
    const collection = await AppendCollection.load<Node>(ceramic, id)
    return new ItemConnectionHandler(collection)
  }

  _collection: AppendCollection<Node>

  constructor(collection: AppendCollection<Node>) {
    this._collection = collection
  }

  get id(): string {
    return this._collection.id.toString()
  }

  async add(node: Node): Promise<Edge<Node>> {
    const cursor = await this._collection.add(node)
    return { cursor: cursor.toString(), node }
  }

  async load(args: ConnectionArguments): Promise<Connection<Node>> {
    let result
    if (args.first) {
      result = await this._collection.first(args.first, args.after)
    } else if (args.last) {
      result = await this._collection.last(args.last, args.before)
    } else {
      throw new Error('Invalid connection arguments')
    }
    return toConnection<Node>(args, result)
  }
}

export class ReferenceConnectionHandler<Node> {
  static async create<Node>(
    ceramic: CeramicApi,
    schemaURL: string,
    nodeSchemaURL: string
  ): Promise<ReferenceConnectionHandler<Node>> {
    const collection = await AppendCollection.create<string>(ceramic, schemaURL)
    return new ReferenceConnectionHandler(ceramic, collection, nodeSchemaURL)
  }

  static async load<Node>(
    ceramic: CeramicApi,
    id: string,
    nodeSchemaURL: string
  ): Promise<ReferenceConnectionHandler<Node>> {
    const collection = await AppendCollection.load<string>(ceramic, id)
    return new ReferenceConnectionHandler(ceramic, collection, nodeSchemaURL)
  }

  _ceramic: CeramicApi
  _collection: AppendCollection<string>
  _nodeSchemaURL: string

  constructor(ceramic: CeramicApi, collection: AppendCollection<string>, nodeSchemaURL: string) {
    this._ceramic = ceramic
    this._collection = collection
    this._nodeSchemaURL = nodeSchemaURL
  }

  get id(): string {
    return this._collection.id.toString()
  }

  async add(content: Node): Promise<Edge<Doc<Node>>> {
    const tile = await TileDocument.create<Node>(this._ceramic, content, {
      schema: this._nodeSchemaURL,
    })
    const id = tile.id.toString()
    const cursor = await this._collection.add(id)
    return { cursor: cursor.toString(), node: { id, content } }
  }

  async load(args: ConnectionArguments): Promise<Connection<Doc<Node>>> {
    let result
    if (args.first) {
      result = await this._collection.first(args.first, args.after)
    } else if (args.last) {
      result = await this._collection.last(args.last, args.before)
    } else {
      throw new Error('Invalid connection arguments')
    }

    const items: Array<ItemResult<Doc<Node>>> = await Promise.all(
      result.items.map(async ({ cursor, data }: ItemResult<string>) => {
        const tile = await TileDocument.load<Node>(this._ceramic, data)
        return { cursor, data: toDoc(tile) }
      })
    )

    return toConnection(args, { items, hasMore: result.hasMore })
  }
}
