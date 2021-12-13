import { CIP88_REF_PREFIX } from '@glazed/constants'
import type { Schema } from '@glazed/types'

/** @internal */
export function getReference(schema: Schema): Array<string> | null {
  if (schema.$comment?.startsWith(CIP88_REF_PREFIX)) {
    const schemasString = schema.$comment.substr(CIP88_REF_PREFIX.length)
    if (schemasString.length) {
      const schemas = schemasString.split('|')
      schemas.sort()
      return schemas
    }
  }
  return null
}

/**
 * Recursively extract references to other schemas from a JSON schema arrays and objects
 *
 * @internal */
export function extractSchemaReferences(schema: Schema, path = ''): Record<string, Array<string>> {
  if (schema.type === 'string') {
    const refs = getReference(schema)
    return refs != null && refs.length > 0 ? { [path]: refs } : {}
  }
  if (schema.type === 'array') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return extractSchemaReferences(schema.items, path)
  }
  if (schema.type === 'object' && schema.properties != null) {
    // TODO: extract collection slice schema URL
    return Object.entries(schema.properties as Record<string, Schema>).reduce(
      (acc, [key, prop]) => {
        const propPath = path === '' ? key : `${path}.${key}`
        return Object.assign(acc, extractSchemaReferences(prop, propPath))
      },
      {} as Record<string, Array<string>>
    )
  }
  return {}
}
