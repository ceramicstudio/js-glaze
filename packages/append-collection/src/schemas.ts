import type { CeramicApi } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { CommitID } from '@ceramicnetwork/streamid'
import { CIP88_APPEND_COLLECTION_PREFIX } from '@glazed/constants'

import type { CollectionSchema, SliceSchema } from './types'

export function createAppendCollectionSchema(
  title: string,
  sliceSchemaCommitID: string
): CollectionSchema {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $comment: `${CIP88_APPEND_COLLECTION_PREFIX}${sliceSchemaCommitID}`,
    title,
    type: 'object',
    properties: {
      sliceMaxItems: { type: 'integer', minimum: 10, maximum: 256 },
      slicesCount: { type: 'integer', minimum: 1 },
    },
    required: ['sliceMaxItems', 'slicesCount'],
  }
}

export function createCollectionSliceSchema<Item>(
  title: string,
  itemSchemas: Array<any>,
  maxItems = 100
): SliceSchema<Item> {
  if (maxItems < 10) {
    throw new Error('maxItems value should be at least 10')
  }
  if (maxItems > 256) {
    throw new Error('maxItems value should be at most 256')
  }

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $comment: 'cip88:collectionSlice',
    title,
    type: 'object',
    properties: {
      collection: { type: 'string', maxLength: 150 },
      sliceIndex: { type: 'integer', minimum: 0 },
      contents: {
        type: 'array',
        maxItems,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        items: { oneOf: [...itemSchemas, { type: 'null' }] },
      },
    },
    required: ['collection', 'sliceIndex', 'contents'],
  }
}

export async function publishCollectionSchemas(
  ceramic: CeramicApi,
  title: string,
  itemSchemas: Array<any>,
  maxItems?: number
): Promise<CommitID> {
  const sliceSchema = await TileDocument.create(
    ceramic,
    createCollectionSliceSchema(`${title}CollectionSlice`, itemSchemas, maxItems)
  )
  const collectionSchema = await TileDocument.create(
    ceramic,
    createAppendCollectionSchema(`${title}Collection`, sliceSchema.commitId.toString())
  )
  return collectionSchema.commitId
}
