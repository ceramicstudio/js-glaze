export type DocID = string

export type IndexKey = string

export interface Definition<T extends Record<string, unknown> = Record<string, unknown>> {
  name: string
  schema: DocID
  description?: string
  url?: string
  config?: T
}

export type DefinitionsAliases = Record<string, DocID>

export interface ContentEntry {
  key: IndexKey
  ref: DocID
  content: unknown
}

export type IdentityIndexContent = Record<IndexKey, DocID>
