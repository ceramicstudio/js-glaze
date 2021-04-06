export interface FieldCommon {
  required?: boolean
}
export interface FieldBoolean extends FieldCommon {
  type: 'boolean'
}
export interface FieldInteger extends FieldCommon {
  type: 'integer'
}
export interface FieldFloat extends FieldCommon {
  type: 'float'
}
export interface FieldString extends FieldCommon {
  type: 'string'
  format?: 'date-time' | 'date' | 'duration' | 'time'
  maxLength?: number
}
export interface FieldList extends FieldCommon {
  type: 'list'
  name: string
}
export interface FieldObject extends FieldCommon {
  type: 'object'
  name: string
}
export interface FieldReference extends FieldCommon {
  type: 'reference'
  name: string
}
export type Field =
  | FieldBoolean
  | FieldInteger
  | FieldFloat
  | FieldString
  | FieldList
  | FieldObject
  | FieldReference

export type ObjectFields = Record<string, Field>

export type DocReference = {
  id: string
  schema: string
}

export type GraphQLDocSetRecords = {
  index: Record<string, DocReference>
  lists: Record<string, string>
  nodes: Record<string, string>
  objects: Record<string, ObjectFields>
  references: Record<string, Array<string>>
  roots: Record<string, DocReference>
}
