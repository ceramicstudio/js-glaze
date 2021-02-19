import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import SecureSchema from 'ajv/lib/refs/json-schema-secure.json'

import { Definition as DefinitionSchema } from './schemas'
import type { Definition, Schema } from './types'

const ajv = new Ajv({ strict: false })
addFormats(ajv as any) // Seems there is a type mismatch with ajv-formats

export const validateDefinition = ajv.compile<Definition>(DefinitionSchema)

export function isValidDefinition(definition: unknown): boolean {
  return validateDefinition(definition)
}

export const validateSchemaSecure = ajv.compile<Schema>(SecureSchema)

export function isSecureSchema(schema: Schema): boolean {
  ajv.compile(schema)
  return validateSchemaSecure(schema)
}
