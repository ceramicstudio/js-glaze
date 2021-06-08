import type { CeramicApi } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { StreamID } from '@ceramicnetwork/streamid'
import type { CommitID } from '@ceramicnetwork/streamid'

import { CERAMIC_APPEND_COLLECTION } from './constants'
import { Cursor } from './cursor'
import type { CursorInput } from './cursor'
import type {
  CollectionContent,
  CollectionDoc,
  CollectionSchema,
  SliceDoc,
  SliceSchema,
} from './types'

export type ItemResult<Item> = {
  cursor: Cursor
  data: Item
}

export type LoadResult<Item> = {
  items: Array<ItemResult<Item>>
  hasMore: boolean
}

const DEFAULT_MAX_ITEMS = 50

export type CreateOptions<Item> = {
  item?: Item
  sliceMaxItems?: number
}

export async function getSliceSchemaID(
  ceramic: CeramicApi,
  collectionSchemaID: CommitID | string
): Promise<string> {
  const collectionSchema = await TileDocument.load<CollectionSchema>(ceramic, collectionSchemaID)
  if (!collectionSchema?.content?.$comment?.startsWith(CERAMIC_APPEND_COLLECTION)) {
    throw new Error('Invalid schema, expecting to be AppendCollection')
  }
  const sliceSchemaCommitID = collectionSchema?.content?.$comment.substr(
    CERAMIC_APPEND_COLLECTION.length
  )
  if (sliceSchemaCommitID === '') {
    throw new Error('Invalid schema, missing sliceSchema')
  }
  return sliceSchemaCommitID
}

export class AppendCollection<Item> {
  _ceramic: CeramicApi
  _collectionID: StreamID
  _sliceSchemaCommitID: string

  static async create<Item>(
    ceramic: CeramicApi,
    schemaID: CommitID,
    options: CreateOptions<Item> = {}
  ): Promise<AppendCollection<Item>> {
    const sliceSchemaCommitID = await getSliceSchemaID(ceramic, schemaID)
    const sliceSchemaDoc = await TileDocument.load<SliceSchema<Item>>(ceramic, sliceSchemaCommitID)

    const collectionDoc = await TileDocument.create<CollectionContent>(
      ceramic,
      {
        sliceMaxItems: options.sliceMaxItems
          ? Math.max(10, Math.min(options.sliceMaxItems), 256)
          : sliceSchemaDoc.content?.properties?.contents.maxItems ?? DEFAULT_MAX_ITEMS,
        slicesCount: 1,
      },
      { schema: schemaID.toUrl() }
    )

    const collection = new AppendCollection<Item>(ceramic, collectionDoc.id, sliceSchemaCommitID)

    if (options.item != null) {
      await collection.add(options.item)
    }

    return collection
  }

  static async load<Item>(
    ceramic: CeramicApi,
    collectionID: StreamID | string
  ): Promise<AppendCollection<Item>> {
    const collection = await TileDocument.load<CollectionDoc>(ceramic, collectionID)
    if (collection.metadata.schema == null) {
      throw new Error('Invalid collection: no schema defined')
    }
    const sliceSchemaCommitID = await getSliceSchemaID(ceramic, collection.metadata.schema)
    return new AppendCollection<Item>(ceramic, collection.id, sliceSchemaCommitID)
  }

  constructor(ceramic: CeramicApi, collectionID: StreamID, sliceSchemaCommitID: string) {
    this._ceramic = ceramic
    this._collectionID = collectionID
    this._sliceSchemaCommitID = sliceSchemaCommitID
  }

  get id(): StreamID {
    return this._collectionID
  }

  _getSliceTag(index: number): string {
    return `${this._collectionID.toString()}:${index}`
  }

  async _getCollection(): Promise<CollectionDoc> {
    return await TileDocument.load(this._ceramic, this._collectionID)
  }

  async _getSliceByCursor(cursor: Cursor): Promise<SliceDoc<Item>> {
    return await TileDocument.load(this._ceramic, cursor.sliceID)
  }

  async _getSliceByTag(tag: string): Promise<SliceDoc<Item>> {
    return await TileDocument.create(
      this._ceramic,
      null as any,
      { deterministic: true, tags: [tag] },
      { anchor: false, publish: false }
    )
  }

  async _getSliceByIndex(index: number): Promise<SliceDoc<Item>> {
    return await this._getSliceByTag(this._getSliceTag(index))
  }

  async getMetadata(): Promise<CollectionContent> {
    const collectionDoc = await this._getCollection()
    return collectionDoc.content
  }

  async add(item: Item): Promise<Cursor> {
    const collectionDoc = await this._getCollection()
    const collection = collectionDoc.content

    const sliceDoc = await this._getSliceByIndex(collection.slicesCount - 1)
    const slice = sliceDoc.content

    // Empty slice, set first item
    if (slice.contents == null) {
      await sliceDoc.update(
        {
          collection: this._collectionID.toString(),
          sliceIndex: collection.slicesCount - 1,
          contents: [item],
        },
        { schema: this._sliceSchemaCommitID }
      )
      return new Cursor(sliceDoc.id, 0)
    }

    // Non-empty and non-full slice, add item
    if (slice.contents.length < collection.sliceMaxItems) {
      await sliceDoc.update({ ...slice, contents: [...slice.contents, item] })
      return new Cursor(sliceDoc.id, slice.contents.length)
    }

    // Existing slice is full, create next one
    const nextSlice = await this._getSliceByIndex(collection.slicesCount)
    await Promise.all([
      collectionDoc.update({ ...collection, slicesCount: collection.slicesCount + 1 }),
      nextSlice.update(
        {
          collection: this._collectionID.toString(),
          sliceIndex: collection.slicesCount,
          contents: [item],
        },
        { schema: this._sliceSchemaCommitID }
      ),
    ])
    return new Cursor(nextSlice.id, 0)
  }

  async first(count: number, after?: CursorInput | null): Promise<LoadResult<Item>> {
    const items: Array<ItemResult<Item>> = []
    let sliceIndex = 0

    if (after != null) {
      const cursor = Cursor.from(after)
      const sliceDoc = await this._getSliceByCursor(cursor)
      const slice = sliceDoc.content
      for (let i = cursor.itemIndex + 1; i < slice.contents.length; i++) {
        const data = slice.contents[i]
        if (data != null) {
          items.push({ cursor: new Cursor(sliceDoc.id, i), data })
        }
      }
      sliceIndex = slice.sliceIndex + 1
    }

    while (items.length < count + 1) {
      const sliceDoc = await this._getSliceByIndex(sliceIndex++)
      const slice = sliceDoc.content
      if (slice.contents == null || slice.contents.length === 0) {
        break
      }
      for (let i = 0; i < slice.contents.length; i++) {
        const data = slice.contents[i]
        if (data != null) {
          items.push({ cursor: new Cursor(sliceDoc.id, i), data })
        }
      }
    }

    return items.length > count
      ? { hasMore: true, items: items.slice(0, count) }
      : { hasMore: false, items }
  }

  async last(count: number, before?: CursorInput | null): Promise<LoadResult<Item>> {
    const items: Array<ItemResult<Item>> = []
    let sliceIndex: number

    if (before == null) {
      const meta = await this.getMetadata()
      sliceIndex = meta.slicesCount - 1
    } else {
      const cursor = Cursor.from(before)
      const sliceDoc = await this._getSliceByCursor(cursor)
      const slice = sliceDoc.content
      for (let i = cursor.itemIndex - 1; i >= 0; i--) {
        const data = slice.contents[i]
        if (data != null) {
          items.push({ cursor: new Cursor(sliceDoc.id, i), data })
        }
      }
      sliceIndex = slice.sliceIndex - 1
    }

    while (items.length < count + 1 && sliceIndex >= 0) {
      const sliceDoc = await this._getSliceByIndex(sliceIndex--)
      const slice = sliceDoc.content
      if (slice.contents == null || slice.contents.length === 0) {
        break
      }
      for (let i = slice.contents.length; i >= 0; i--) {
        const data = slice.contents[i]
        if (data != null) {
          items.push({ cursor: new Cursor(sliceDoc.id, i), data })
        }
      }
    }

    return items.length > count
      ? { hasMore: true, items: items.slice(0, count) }
      : { hasMore: false, items }
  }
}
