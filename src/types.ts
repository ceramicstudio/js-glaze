export type DocID = string

export interface Definition<T extends Record<string, unknown> = Record<string, unknown>> {
  name: string
  schema: DocID
  description?: string
  url?: string
  config?: T
}

export type DefinitionsAliases = Record<string, DocID>

export type SchemaType =
  | 'BasicProfile'
  | 'Definition'
  | 'DocIdDocIdMap'
  | 'DocIdList'
  | 'DocIdMap'
  | 'StringMap'
export type SchemasAliases = Record<SchemaType, DocID>
