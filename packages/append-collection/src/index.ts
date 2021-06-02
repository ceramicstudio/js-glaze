import type { CeramicApi } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { StreamID } from '@ceramicnetwork/streamid'
import type { CommitID } from '@ceramicnetwork/streamid'
import { fromString, toString } from 'uint8arrays'

const CERAMIC_COLLECTION_TYPE = 'ceramic:appendCollection'

type CollectionSchema = {
  $schema: string
  $comment: string
  title: string
  type: 'object'
  properties: {
    sliceMaxItems: { type: 'integer'; minimum: 10; maximum: 256 }
    slicesCount: { type: 'integer'; minimum: 1 }
  }
  required: ['sliceMaxItems', 'slicesCount']
}

export function createAppendCollectionSchema(
  title: string,
  sliceSchemaCommitID: string
): CollectionSchema {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $comment: `${CERAMIC_COLLECTION_TYPE}:${sliceSchemaCommitID}`,
    title,
    type: 'object',
    properties: {
      sliceMaxItems: { type: 'integer', minimum: 10, maximum: 256 },
      slicesCount: { type: 'integer', minimum: 1 },
    },
    required: ['sliceMaxItems', 'slicesCount'],
  }
}

type SliceSchema = {
  $schema: string
  $comment: string
  title: string
  type: 'object'
  properties: {
    collection: { type: 'string'; maxLength: 150 }
    sliceIndex: { type: 'integer'; minimum: 0 }
    contents: {
      type: 'array'
      maxItems: number
      items: { oneOf: Array<Record<string, any>> }
    }
  }
  required: ['collection', 'sliceIndex', 'contents']
}

export function createCollectionSliceSchema(
  title: string,
  itemSchemas: Array<Record<string, any>>,
  maxItems = 100
): SliceSchema {
  if (maxItems < 10) {
    throw new Error('maxItems value should be at least 10')
  }
  if (maxItems > 256) {
    throw new Error('maxItems value should be at most 256')
  }

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $comment: 'ceramic:collectionSlice',
    title,
    type: 'object',
    properties: {
      collection: { type: 'string', maxLength: 150 },
      sliceIndex: { type: 'integer', minimum: 0 },
      contents: {
        type: 'array',
        maxItems,
        items: { oneOf: [...itemSchemas, { type: 'null' }] },
      },
    },
    required: ['collection', 'sliceIndex', 'contents'],
  }
}

export type CursorInput = Cursor | Uint8Array | string

export class Cursor {
  static BASE = 'base64url' as const

  static fromBytes(bytes: Uint8Array): Cursor {
    const view = new DataView(bytes.buffer)
    const index = view.getUint8(bytes.byteLength - 1)
    const id = StreamID.fromBytes(bytes.slice(0, -1))
    return new Cursor(id, index)
  }

  static fromString(value: string): Cursor {
    return Cursor.fromBytes(fromString(value, Cursor.BASE))
  }

  static from(input: CursorInput): Cursor {
    if (input instanceof Cursor) {
      return input
    }
    return typeof input === 'string' ? Cursor.fromString(input) : Cursor.fromBytes(input)
  }

  _sliceID: StreamID
  _itemIndex: number

  constructor(sliceID: StreamID, itemIndex: number) {
    this._sliceID = sliceID
    this._itemIndex = itemIndex
  }

  get sliceID(): StreamID {
    return this._sliceID
  }

  get itemIndex(): number {
    return this._itemIndex
  }

  toBytes(): Uint8Array {
    const id = this._sliceID.bytes
    const output = new Uint8Array(id.byteLength + 1)
    output.set(id)
    const view = new DataView(output.buffer)
    view.setUint8(id.byteLength, this._itemIndex)
    return output
  }

  toString(): string {
    return toString(this.toBytes(), Cursor.BASE)
  }

  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return `Cursor(${this._sliceID.toString()}:${this._itemIndex})`
  }
}

type CollectionContent = {
  sliceMaxItems: number
  slicesCount: number
}
type CollectionDoc = TileDocument<CollectionContent>

type SliceContent<Item> = {
  collection: string
  sliceIndex: number
  contents: Array<Item>
}
type SliceDoc<Item> = TileDocument<SliceContent<Item>>

type ItemResult<Item> = {
  cursor: Cursor
  item: Item
}

type LoadResult<Item> = {
  items: Array<ItemResult<Item>>
  hasMore: boolean
}

const DEFAULT_MAX_ITEMS = 50

type CreateOptions<Item> = {
  item?: Item
  sliceMaxItems?: number
}

export class AppendCollection<Item = unknown> {
  _ceramic: CeramicApi
  _collectionID: StreamID
  _sliceSchemaCommitID: string

  static async create<Item>(
    ceramic: CeramicApi,
    schemaID: CommitID,
    options: CreateOptions<Item> = {}
  ): Promise<AppendCollection<Item>> {
    const collectionSchema = await TileDocument.load<CollectionSchema>(ceramic, schemaID)
    if (!collectionSchema?.content?.$comment?.startsWith(CERAMIC_COLLECTION_TYPE)) {
      throw new Error('Invalid schema, expecting to be AppendCollection')
    }
    const sliceSchemaCommitID = collectionSchema?.content?.$comment.substr(
      CERAMIC_COLLECTION_TYPE.length + 1
    )
    if (sliceSchemaCommitID === '') {
      throw new Error('Invalid schema, missing sliceSchema')
    }
    const sliceSchemaDoc = await TileDocument.load<SliceSchema>(ceramic, sliceSchemaCommitID)

    const collectionDoc = await TileDocument.create(
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

  async first(count: number, after?: CursorInput): Promise<LoadResult<Item>> {
    const items: Array<ItemResult<Item>> = []
    let sliceIndex = 0

    if (after != null) {
      const cursor = Cursor.from(after)
      const sliceDoc = await this._getSliceByCursor(cursor)
      const slice = sliceDoc.content
      for (let i = cursor.itemIndex + 1; i < slice.contents.length; i++) {
        const item = slice.contents[i]
        if (item != null) {
          items.push({ cursor: new Cursor(sliceDoc.id, i), item })
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
        const item = slice.contents[i]
        if (item != null) {
          items.push({ cursor: new Cursor(sliceDoc.id, i), item })
        }
      }
    }

    return items.length > count
      ? { hasMore: true, items: items.slice(0, count) }
      : { hasMore: false, items }
  }

  async last(count: number, before?: CursorInput): Promise<LoadResult<Item>> {
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
        const item = slice.contents[i]
        if (item != null) {
          items.push({ cursor: new Cursor(sliceDoc.id, i), item })
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
        const item = slice.contents[i]
        if (item != null) {
          items.push({ cursor: new Cursor(sliceDoc.id, i), item })
        }
      }
    }

    return items.length > count
      ? { hasMore: true, items: items.slice(0, count) }
      : { hasMore: false, items }
  }
}
