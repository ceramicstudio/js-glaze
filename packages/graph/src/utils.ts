import type { RuntimeCompositeDefinition } from '@glazed/types'
import { printSchema } from 'graphql'

import { createGraphQLSchema } from './schema.js'

/**
 * Create a GraphQL schema from a runtime composite definition and return its string
 * representation.
 */
export function printGraphQLSchema(
  definition: RuntimeCompositeDefinition,
  readonly = false
): string {
  return printSchema(createGraphQLSchema({ definition, readonly }))
}
