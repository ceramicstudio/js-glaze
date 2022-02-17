import type { CeramicApi } from '@ceramicnetwork/common'
import type { DataModel } from '@glazed/datamodel'
import type { GraphQLModel } from '@glazed/graphql-types'
import type { TileCache, TileLoader } from '@glazed/tile-loader'
import type { ModelTypeAliases, ModelTypesToAliases } from '@glazed/types'
import {
  type DocumentNode,
  type ExecutionResult,
  type GraphQLError,
  type Source,
  GraphQLSchema,
  execute,
  parse,
  validate,
} from 'graphql'

import { Context } from './context.js'
import { createGraphQLSchema } from './schema.js'

export type GraphQLClientConfig<ModelTypes extends ModelTypeAliases = ModelTypeAliases> = {
  cache?: TileCache | boolean
  ceramic: CeramicApi
  loader?: TileLoader
  model: DataModel<ModelTypes> | ModelTypesToAliases<ModelTypes>
  schema: GraphQLSchema | GraphQLModel
}

export class GraphQLClient<ModelTypes extends ModelTypeAliases = ModelTypeAliases> {
  #context: Context<ModelTypes>
  #schema: GraphQLSchema

  constructor(config: GraphQLClientConfig<ModelTypes>) {
    const { schema, ...contextConfig } = config
    this.#context = new Context(contextConfig)
    this.#schema = schema instanceof GraphQLSchema ? schema : createGraphQLSchema({ model: schema })
  }

  get context(): Context<ModelTypes> {
    return this.#context
  }

  async execute(
    source: string | Source,
    variableValues?: Record<string, unknown>
  ): Promise<ExecutionResult> {
    let document: DocumentNode
    try {
      document = parse(source)
    } catch (syntaxError) {
      return {
        errors: [syntaxError as GraphQLError],
      }
    }

    const validationErrors = validate(this.#schema, document)
    if (validationErrors.length > 0) {
      return {
        errors: validationErrors,
      }
    }

    return await execute({
      document,
      variableValues,
      contextValue: this.#context,
      schema: this.#schema,
    })
  }
}
