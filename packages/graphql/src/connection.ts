import type { TileDocument } from '@ceramicnetwork/stream-tile'
import { AppendCollection } from '@glazed/append-collection'
import type { ItemResult, LoadResult } from '@glazed/append-collection'
import type { TileLoader } from '@glazed/tile-loader'
import type { Connection, ConnectionArguments, Edge } from 'graphql-relay'

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
    loader: TileLoader,
    schemaURL: string
  ): Promise<ItemConnectionHandler<Node>> {
    const collection = await AppendCollection.create<Node>(loader, schemaURL)
    return new ItemConnectionHandler(collection)
  }

  static async load<Node>(loader: TileLoader, id: string): Promise<ItemConnectionHandler<Node>> {
    const collection = await AppendCollection.load<Node>(loader, id)
    return new ItemConnectionHandler(collection)
  }

  #collection: AppendCollection<Node>

  constructor(collection: AppendCollection<Node>) {
    this.#collection = collection
  }

  get id(): string {
    return this.#collection.id.toString()
  }

  async add(node: Node): Promise<Edge<Node>> {
    const cursor = await this.#collection.add(node)
    return { cursor: cursor.toString(), node }
  }

  async load(args: ConnectionArguments): Promise<Connection<Node>> {
    let result
    if (args.first) {
      result = await this.#collection.first(args.first, args.after)
    } else if (args.last) {
      result = await this.#collection.last(args.last, args.before)
    } else {
      throw new Error('Invalid connection arguments')
    }
    return toConnection<Node>(args, result)
  }
}

export class ReferenceConnectionHandler<Node> {
  static async create<Node>(
    loader: TileLoader,
    schemaURL: string,
    nodeSchemaURL: string
  ): Promise<ReferenceConnectionHandler<Node>> {
    const collection = await AppendCollection.create<string>(loader, schemaURL)
    return new ReferenceConnectionHandler(loader, collection, nodeSchemaURL)
  }

  static async load<Node>(
    loader: TileLoader,
    id: string,
    nodeSchemaURL: string
  ): Promise<ReferenceConnectionHandler<Node>> {
    const collection = await AppendCollection.load<string>(loader, id)
    return new ReferenceConnectionHandler(loader, collection, nodeSchemaURL)
  }

  #loader: TileLoader
  #collection: AppendCollection<string>
  #nodeSchemaURL: string

  constructor(loader: TileLoader, collection: AppendCollection<string>, nodeSchemaURL: string) {
    this.#loader = loader
    this.#collection = collection
    this.#nodeSchemaURL = nodeSchemaURL
  }

  get id(): string {
    return this.#collection.id.toString()
  }

  async add(content: Node): Promise<Edge<TileDocument<Node>>> {
    const node = await this.#loader.create<Node>(content, { schema: this.#nodeSchemaURL })
    const cursor = await this.#collection.add(node.id.toString())
    return { cursor: cursor.toString(), node }
  }

  async load(args: ConnectionArguments): Promise<Connection<TileDocument<Node>>> {
    let result
    if (args.first) {
      result = await this.#collection.first(args.first, args.after)
    } else if (args.last) {
      result = await this.#collection.last(args.last, args.before)
    } else {
      throw new Error('Invalid connection arguments')
    }

    const items: Array<ItemResult<TileDocument<Node>>> = await Promise.all(
      result.items.map(async ({ cursor, data }: ItemResult<string>) => {
        return { cursor, data: await this.#loader.load<Node>(data) }
      })
    )

    return toConnection(args, { items, hasMore: result.hasMore })
  }
}
