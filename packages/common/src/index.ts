import type { JSONSchemaType } from 'ajv'

export type Definition<C extends Record<string, any> = Record<string, any>> = {
  name: string
  description: string
  schema: string
  url?: string
  config?: C
}

export type Schema<T = Record<string, any>> = JSONSchemaType<T> & {
  $comment?: string
  title?: string
}

export type ModelData<T> = {
  definitions: Record<string, T>
  schemas: Record<string, T>
  tiles: Record<string, T>
}

export type PublishedModel = ModelData<string>

export const CIP88_APPEND_COLLECTION_PREFIX = 'cip88:appendCollection:'
export const CIP88_REF_PREFIX = 'cip88:ref:'
