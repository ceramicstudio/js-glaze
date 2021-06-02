/**
 * @jest-environment idx
 */

import { CeramicApi } from '@ceramicnetwork/common'
import type { CommitID } from '@ceramicnetwork/streamid'
import { publishSchema } from '@ceramicstudio/idx-tools'

import {
  AppendCollection,
  Cursor,
  createAppendCollectionSchema,
  createCollectionSliceSchema,
} from '../src'

declare global {
  const ceramic: CeramicApi
}

function cursorsToString<T = any>(res: Record<string, any>): Record<string, any> {
  return {
    ...res,
    // eslint-disable-next-line
    items: res.items.map(({ cursor, item }: { cursor: Cursor; item: T }) => ({
      item,
      cursor: cursor.toString(),
    })),
  }
}

async function publishCollectionSchemas(
  title: string,
  itemSchemas: Array<Record<string, any>>,
  maxItems?: number
): Promise<CommitID> {
  const sliceSchema = await publishSchema(ceramic, {
    name: `${title}CollectionSlice`,
    content: createCollectionSliceSchema(`${title}CollectionSlice`, itemSchemas, maxItems),
  })
  const collectionSchema = await publishSchema(ceramic, {
    name: `${title}Collection`,
    content: createAppendCollectionSchema(`${title}Collection`, sliceSchema.commitId.toString()),
  })
  return collectionSchema.commitId
}

describe('append-collection', () => {
  jest.setTimeout(20000)

  let collectionSchemaID: CommitID

  beforeAll(async () => {
    collectionSchemaID = await publishCollectionSchemas(
      'Test',
      [{ type: 'string', maxLength: 100 }],
      10
    )
  })

  test('create and load single item', async () => {
    const collection = await AppendCollection.create<string>(ceramic, collectionSchemaID)
    expect(collection).toBeInstanceOf(AppendCollection)

    const cursor = await collection.add('first')
    expect(cursor).toBeInstanceOf(Cursor)

    await expect(collection.first(3)).resolves.toEqual({
      hasMore: false,
      items: [{ cursor, item: 'first' }],
    })

    await expect(collection.last(2)).resolves.toEqual({
      hasMore: false,
      items: [{ cursor, item: 'first' }],
    })
  })

  test('create and load all items', async () => {
    const collection = await AppendCollection.create<string>(ceramic, collectionSchemaID)
    expect(collection).toBeInstanceOf(AppendCollection)

    const items = ['one', 'two', 'three', 'four', 'five']
    for (const item of items) {
      await collection.add(item)
    }

    const [loadedFirst, loadedLast] = await Promise.all([collection.first(5), collection.last(5)])
    expect(loadedFirst.items).toEqual(loadedLast.items.reverse())
  })

  test('supports cursors', async () => {
    const collection = await AppendCollection.create<string>(ceramic, collectionSchemaID)
    expect(collection).toBeInstanceOf(AppendCollection)

    const cursors: Array<Cursor> = []
    const items = ['one', 'two', 'three', 'four', 'five', 'six']
    for (const item of items) {
      cursors.push(await collection.add(item))
    }

    const [before, after] = await Promise.all([
      collection.last(1, cursors[2]),
      collection.first(2, cursors[2]),
    ])

    expect(cursorsToString(before)).toEqual(
      cursorsToString({
        hasMore: true,
        items: [{ item: 'two', cursor: cursors[1] }],
      })
    )
    expect(cursorsToString(after)).toEqual(
      cursorsToString({
        hasMore: true,
        items: [
          { item: 'four', cursor: cursors[3] },
          { item: 'five', cursor: cursors[4] },
        ],
      })
    )
  })

  test('creates multiple slices', async () => {
    const collection = await AppendCollection.create<string>(ceramic, collectionSchemaID)
    expect(collection).toBeInstanceOf(AppendCollection)

    const items = [
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
    ]
    for (const item of items) {
      await collection.add(item)
    }

    await expect(collection.getMetadata()).resolves.toEqual({
      sliceMaxItems: 10,
      slicesCount: 2,
    })
  })
})
