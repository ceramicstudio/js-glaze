import Ajv from 'ajv'
import type { JSONSchemaType } from 'ajv'
import addFormats from 'ajv-formats'
import SecureSchema from 'ajv/lib/refs/json-schema-secure.json'

import { Definition as DefinitionSchema } from './schemas'
import type { Definition } from './types'

const ajv = new Ajv()
addFormats(ajv)

export const validateDefinition = ajv.compile<Definition>(DefinitionSchema)

export function isValidDefinition(definition: unknown): boolean {
  return validateDefinition(definition)
}

// Seems the secure schema is not strict, this causes warnings to be logged
export const validateSchemaSecure = new Ajv({ strict: false }).compile(SecureSchema)

export function isSecureSchema<T = Record<string, any>>(schema: JSONSchemaType<T>): boolean {
  ajv.compile(schema)
  return validateSchemaSecure(schema)
}
