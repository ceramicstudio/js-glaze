import type { TileDocument } from '@ceramicnetwork/stream-tile'
import { GraphQLID, GraphQLNonNull } from 'graphql'
import type { GraphQLFieldConfigMap } from 'graphql'
import { toGlobalId } from 'graphql-relay'

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

export function toDoc<T>(tile: TileDocument<T>): Doc<T> {
  return {
    content: (tile.content ?? {}) as T,
    id: tile.id.toString(),
    schema: tile.metadata.schema,
  }
}
