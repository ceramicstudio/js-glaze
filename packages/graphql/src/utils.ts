import type { GraphModel, ModelTypeAliases, ModelTypesToAliases } from '@glazed/types'
import { printSchema } from 'graphql'

import { createGraphQLSchema } from './schema.js'

export function graphModelToAliases<ModelTypes extends ModelTypeAliases = ModelTypeAliases>(
  model: GraphModel
): ModelTypesToAliases<ModelTypes> {
  const aliases = {
    definitions: Object.entries(model.index).reduce((acc, [alias, { id }]) => {
      acc[alias] = id
      return acc
    }, {} as Record<string, string>),
    schemas: Object.entries(model.referenced).reduce((acc, [commitURL, { name }]) => {
      acc[name] = commitURL
      return acc
    }, {} as Record<string, string>),
    tiles: Object.entries(model.roots).reduce((acc, [alias, { id }]) => {
      acc[alias] = id
      return acc
    }, {} as Record<string, string>),
  }

  return aliases as ModelTypesToAliases<ModelTypes>
}

export function printGraphQLSchema(model: GraphModel): string {
  return printSchema(createGraphQLSchema({ model }))
}
