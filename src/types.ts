export type DocID = string

export interface Definition<T extends Record<string, unknown> = Record<string, unknown>> {
  name: string
  schema: DocID
  description?: string
  url?: string
  config?: T
}

export type DefinitionsAliases = Record<string, DocID>

export interface Entry {
  tags: Array<string>
  ref: DocID
}

export interface DefinitionEntry extends Entry {
  def: DocID
}

export interface ContentEntry extends DefinitionEntry {
  content: unknown
}

export type IdentityIndexContent = Record<DocID, Entry>

export type SchemaType =
  | 'BasicProfile'
  | 'Definition'
  | 'DocIdDocIdMap'
  | 'DocIdMap'
  | 'IdentityIndex'
  | 'StringMap'
export type SchemasAliases = Record<SchemaType, DocID>
