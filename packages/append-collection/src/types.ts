import type { TileDocument } from '@ceramicnetwork/stream-tile'
import type { Schema } from '@glazed/common'

export type CollectionContent = {
  sliceMaxItems: number
  slicesCount: number
}
export type CollectionDoc = TileDocument<CollectionContent>
export type CollectionSchema = Schema<CollectionContent>

export type SliceContent<Item> = {
  collection: string
  sliceIndex: number
  contents: Array<Item | null>
}
export type SliceDoc<Item> = TileDocument<SliceContent<Item>>
export type SliceSchema<Item> = Schema<SliceContent<Item>>
