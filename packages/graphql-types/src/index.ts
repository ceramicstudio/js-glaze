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

export type ReferenceEntry = {
  owner: string
  schemas: Array<string>
}

export type FieldList = {
  type: 'list'
  name: string
}
export type FieldObject = {
  type: 'object'
  name: string
}
export type FieldReference = ReferenceEntry & {
  type: 'reference'
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
export type ObjectEntry = {
  fields: ObjectFields
  parents?: Array<string> | null
}

export type CollectionEntry = {
  schema: string
  item: ItemField
}
export type ReferencedEntry = {
  type: 'collection' | 'object'
  name: string
}
export type TileEntry = {
  id: string
  schema: string
}

export type GraphQLModel = {
  collections: Record<string, CollectionEntry> // alias to collection entry
  index: Record<string, TileEntry> // alias to tile entry
  lists: Record<string, ItemField> // list alias to item type
  objects: Record<string, ObjectEntry> // alias to entry
  roots: Record<string, TileEntry> // alias to tile entry
  referenced: Record<string, ReferencedEntry> // schema URL to referenced type
  references: Record<string, ReferenceEntry> // alias to reference entry
}
