import type { LoadResult } from '@ceramicstudio/append-collection'
import type { TileDocument } from '@ceramicnetwork/stream-tile'
import { GraphQLID, GraphQLNonNull } from 'graphql'
import type { GraphQLFieldConfigMap } from 'graphql'
import { toGlobalId } from 'graphql-relay'
import type { Connection, ConnectionArguments } from 'graphql-relay'

import type { Context } from './context'
import type { Doc } from './types'

export function createGlobalId(typeName: string): GraphQLFieldConfigMap<Doc, Context> {
  return {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (doc): string => {
        if (doc.id == null) {
          throw new Error(`No ID associated to doc ${typeName}`)
        }
        return toGlobalId(typeName, doc.id)
      },
    },
  }
}

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

export function toDoc<T>(tile: TileDocument<T>): Doc<T> {
  return {
    content: (tile.content ?? {}) as T,
    id: tile.id.toString(),
    schema: tile.metadata.schema,
  }
}
