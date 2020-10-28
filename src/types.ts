export type IndexKey = string

export interface Definition<T extends Record<string, unknown> = Record<string, unknown>> {
  name: string
  schema: string
  description?: string
  url?: string
  config?: T
}

export type DefinitionsAliases = Record<string, string>

export interface ContentEntry {
  key: IndexKey
  ref: string
  content: unknown
}

export type IdentityIndexContent = Record<IndexKey, string>
