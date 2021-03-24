import type { CeramicApi, Doctype } from '@ceramicnetwork/common'
import DocID from '@ceramicnetwork/docid'
import { fromString, toString } from 'uint8arrays'

export function createAppendCollectionSchema(
  title: string,
  sliceSchemaCommitID: string
): Record<string, any> {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $ceramic: { type: 'appendCollection', sliceSchema: sliceSchemaCommitID },
    title,
    type: 'object',
    properties: {
      sliceMaxItems: { type: 'integer', minimum: 10, maximum: 256 },
      slicesCount: { type: 'integer', minimum: 1 },
    },
    required: ['sliceMaxItems', 'slicesCount'],
  }
}

export function createCollectionSliceSchema(
  title: string,
  itemSchemas: Array<Record<string, any>>,
  maxItems = 100
): Record<string, any> {
  if (maxItems < 10) {
    throw new Error('maxItems value should be at least 10')
  }
  if (maxItems > 256) {
    throw new Error('maxItems value should be at most 256')
  }

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $ceramic: { type: 'collectionSlice' },
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
    const id = DocID.fromBytes(bytes.slice(0, -1))
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

  _sliceID: DocID
  _itemIndex: number

  constructor(sliceID: DocID, itemIndex: number) {
    this._sliceID = sliceID
    this._itemIndex = itemIndex
  }

  get sliceID(): DocID {
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
type SliceContent<Item> = {
  sliceIndex: number
  contents: Array<Item>
}

type ItemResult<Item> = {
  cursor: Cursor
  item: Item
}

type LoadResult<Item> = {
  items: Array<ItemResult<Item>>
  hasMore: boolean
}

const CERAMIC_COLLECTION_TYPE = 'appendCollection'

const DEFAULT_MAX_ITEMS = 50

type CreateOptions<Item> = {
  item?: Item
  sliceMaxItems?: number
}

export class AppendCollection<Item = unknown> {
  _ceramic: CeramicApi
  _collectionID: DocID
  _sliceSchemaCommitID: string

  static async create<Item>(
    ceramic: CeramicApi,
    schemaID: DocID,
    options: CreateOptions<Item> = {}
  ): Promise<AppendCollection<Item>> {
    const collectionSchema = await ceramic.loadDocument(schemaID)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (collectionSchema?.content?.$ceramic?.type !== CERAMIC_COLLECTION_TYPE) {
      throw new Error('Invalid schema, expecting to be AppendCollection')
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const sliceSchemaCommitID = collectionSchema.content.$ceramic.sliceSchema as string | undefined
    if (sliceSchemaCommitID == null) {
      throw new Error('Invalid schema, missing sliceSchema')
    }
    const sliceSchemaDoc = await ceramic.loadDocument(sliceSchemaCommitID)

    const collectionDoc = await ceramic.createDocument('tile', {
      content: {
        sliceMaxItems: options.sliceMaxItems
          ? Math.max(10, Math.min(options.sliceMaxItems), 256)
          : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (sliceSchemaDoc.content?.properties?.contents.maxItems as number) ?? DEFAULT_MAX_ITEMS,
        slicesCount: 1,
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore missing controllers required in type
      metadata: { schema: schemaID.toUrl() },
    })

    const collection = new AppendCollection<Item>(ceramic, collectionDoc.id, sliceSchemaCommitID)

    if (options.item != null) {
      await collection.add(options.item)
    }

    return collection
  }

  constructor(ceramic: CeramicApi, collectionID: DocID, sliceSchemaCommitID: string) {
    this._ceramic = ceramic
    this._collectionID = collectionID
    this._sliceSchemaCommitID = sliceSchemaCommitID
  }

  get id(): DocID {
    return this._collectionID
  }

  async _getCollection(): Promise<Doctype> {
    return await this._ceramic.loadDocument(this._collectionID)
  }

  async _getSliceByCursor(cursor: Cursor): Promise<Doctype> {
    return await this._ceramic.loadDocument(cursor.sliceID)
  }

  async _getSliceByIndex(index: number): Promise<Doctype> {
    return await this._ceramic.createDocument(
      'tile',
      {
        content: {
          collection: this._collectionID.toString(),
          sliceIndex: index,
          contents: [],
        },
        deterministic: true,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore missing controllers required in type
        metadata: { schema: this._sliceSchemaCommitID },
      },
      { anchor: false, publish: false }
    )
  }

  async getMetadata(): Promise<CollectionContent> {
    const collectionDoc = await this._getCollection()
    return collectionDoc.content as CollectionContent
  }

  async add(item: Item): Promise<Cursor> {
    const collectionDoc = await this._getCollection()
    const collection = collectionDoc.content as CollectionContent

    const sliceDoc = await this._getSliceByIndex(collection.slicesCount - 1)
    const slice = sliceDoc.content as SliceContent<Item>

    if (slice.contents.length >= collection.sliceMaxItems) {
      const nextSlice = await this._getSliceByIndex(collection.slicesCount)
      await Promise.all([
        collectionDoc.change({
          content: { ...collection, slicesCount: collection.slicesCount + 1 },
        }),
        nextSlice.change({
          content: { ...(nextSlice.content as SliceContent<Item>), contents: [item] },
        }),
      ])
      return new Cursor(nextSlice.id, 0)
    }

    await sliceDoc.change({ content: { ...slice, contents: [...slice.contents, item] } })
    return new Cursor(sliceDoc.id, slice.contents.length)
  }

  async first(count: number, after?: CursorInput): Promise<LoadResult<Item>> {
    const items: Array<ItemResult<Item>> = []
    let sliceIndex = 0

    if (after != null) {
      const cursor = Cursor.from(after)
      const sliceDoc = await this._getSliceByCursor(cursor)
      const slice = sliceDoc.content as SliceContent<Item>
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
      const slice = sliceDoc.content as SliceContent<Item>
      if (slice.contents.length === 0) {
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
      const slice = sliceDoc.content as SliceContent<Item>
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
      const slice = sliceDoc.content as SliceContent<Item>
      if (slice.contents.length === 0) {
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
