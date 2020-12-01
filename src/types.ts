import type DocID from '@ceramicnetwork/docid'

export type IndexKey = string

export interface Definition<T extends Record<string, unknown> = Record<string, unknown>> {
  name: string
  schema: string
  description?: string
  url?: string
  config?: T
}

export interface DefinitionWithID<T extends Record<string, unknown> = Record<string, unknown>>
  extends Definition<T> {
  id: DocID
}

export type DefinitionsAliases = Record<string, string>

export interface ContentEntry {
  key: IndexKey
  ref: string
  content: unknown
}

export type IdentityIndexContent = Record<IndexKey, string>
