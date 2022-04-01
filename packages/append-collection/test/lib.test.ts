/**
 * @jest-environment glaze
 */

import type { CeramicApi } from '@ceramicnetwork/common'
import type { CommitID } from '@ceramicnetwork/streamid'
import { jest } from '@jest/globals'

import { AppendCollection, Cursor, publishCollectionSchemas } from '../src'

declare global {
  const ceramic: CeramicApi
}

function cursorsToString<T = any>(res: Record<string, any>): Record<string, any> {
  return {
    ...res,
    // eslint-disable-next-line
    items: res.items.map(({ cursor, data }: { cursor: Cursor; data: T }) => ({
      data,
      cursor: cursor.toString(),
    })),
  }
}

describe('append-collection', () => {
  jest.setTimeout(60000)

  let collectionSchemaID: CommitID

  beforeAll(async () => {
    collectionSchemaID = await publishCollectionSchemas(
      ceramic,
      'Test',
      [{ type: 'string', maxLength: 100 }],
      10
    )
  })

  test('create and load static methods', async () => {
    const created = await AppendCollection.create<string>(ceramic, collectionSchemaID)
    expect(created).toBeInstanceOf(AppendCollection)
    const cursor = await created.add('first')

    const loaded = await AppendCollection.load<string>(ceramic, created.id)
    expect(loaded).toBeInstanceOf(AppendCollection)
    await expect(loaded.first(1)).resolves.toEqual({
      hasMore: false,
      items: [{ cursor, data: 'first' }],
    })
  })

  test('create and load single item', async () => {
    const collection = await AppendCollection.create<string>(ceramic, collectionSchemaID)
    expect(collection).toBeInstanceOf(AppendCollection)

    const cursor = await collection.add('first')
    expect(cursor).toBeInstanceOf(Cursor)

    await expect(collection.first(3)).resolves.toEqual({
      hasMore: false,
      items: [{ cursor, data: 'first' }],
    })

    await expect(collection.last(2)).resolves.toEqual({
      hasMore: false,
      items: [{ cursor, data: 'first' }],
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
        items: [{ data: 'two', cursor: cursors[1] }],
      })
    )
    expect(cursorsToString(after)).toEqual(
      cursorsToString({
        hasMore: true,
        items: [
          { data: 'four', cursor: cursors[3] },
          { data: 'five', cursor: cursors[4] },
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
