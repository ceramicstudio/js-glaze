import Ajv from 'ajv'
import type { JSONSchemaType } from 'ajv'
import addFormats from 'ajv-formats'
import SecureSchema from 'ajv/lib/refs/json-schema-secure.json'

// Seems the secure schema is not strict, this causes warnings to be logged
export const validateSchemaSecure = new Ajv({ strict: false }).compile(SecureSchema)

export function isSecureSchema<T = Record<string, any>>(schema: JSONSchemaType<T>): boolean {
  const ajv = new Ajv()
  addFormats(ajv)
  ajv.compile(schema)
  return validateSchemaSecure(schema)
}
