export type FieldBoolean = {
  type: 'boolean'
}
export type FieldInteger = {
  type: 'integer'
}
export type FieldFloat = {
  type: 'float'
}
export type FieldString = {
  type: 'string'
  format?: 'date-time' | 'date' | 'duration' | 'time'
  maxLength?: number
}

export type FieldList = {
  type: 'list'
  name: string
}
export type FieldObject = {
  type: 'object'
  name: string
}
export type FieldReference = {
  type: 'reference'
  name: string
}

export type ItemField =
  | FieldBoolean
  | FieldInteger
  | FieldFloat
  | FieldString
  | FieldObject
  | FieldReference

export type ObjectField = (FieldList | ItemField) & { required?: boolean }
export type ObjectFields = Record<string, ObjectField>

export type CollectionEntry = {
  sliceSchema: string
  item: FieldObject | FieldReference
}
export type NodeEntry = {
  type: 'collection' | 'object'
  name: string
}
export type TileEntry = {
  id: string
  schema: string
}

export type CollectionReference = {
  type: 'collection'
  schema: string
}
export type NodeReference = {
  type: 'node'
  schemas: Array<string>
}
export type ReferenceEntry = CollectionReference | NodeReference

export type GraphQLDocSetRecords = {
  collections: Record<string, CollectionEntry> // alias to collection entry
  index: Record<string, TileEntry> // alias to tile reference
  lists: Record<string, ItemField> // list alias to item type
  nodes: Record<string, NodeEntry> // stream URL to entry
  objects: Record<string, ObjectFields> // alias to fields
  references: Record<string, Array<string>> // alias to array of stream URLs
  roots: Record<string, TileEntry> // alias to tile reference
}
