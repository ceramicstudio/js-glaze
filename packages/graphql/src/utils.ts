import type { GraphQLModel } from '@glazed/graphql-types'
import { printSchema } from 'graphql'

import { createGraphQLSchema } from './schema.js'

export function printGraphQLSchema(model: GraphQLModel): string {
  return printSchema(createGraphQLSchema({ model }))
}
