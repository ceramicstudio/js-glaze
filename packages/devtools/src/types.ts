import type { JSONSchema } from '@glazed/types'

export type ScalarSchema =
  | JSONSchema.Boolean
  | JSONSchema.Integer
  | JSONSchema.Number
  | JSONSchema.String

export type AnySchema = ScalarSchema | JSONSchema.Array | JSONSchema.Object
