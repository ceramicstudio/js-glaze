import type { RuntimeCompositeDefinition } from '@glazed/types'
import { printSchema } from 'graphql'

import { createGraphQLSchema } from './schema.js'

export function printGraphQLSchema(
  definition: RuntimeCompositeDefinition,
  readonly = false
): string {
  return printSchema(createGraphQLSchema({ definition, readonly }))
}
