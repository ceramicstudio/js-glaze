import type { CeramicApi } from '@ceramicnetwork/common'
import type { DataModel } from '@glazed/datamodel'
import type { GraphQLModel } from '@glazed/graphql-types'
import type { TileCache, TileLoader } from '@glazed/tile-loader'
import type { ModelTypeAliases, ModelTypesToAliases } from '@glazed/types'
import {
  type DocumentNode,
  type ExecutionResult,
  type GraphQLError,
  type GraphQLSchema,
  type Source,
  execute,
  parse,
  validate,
} from 'graphql'

import { Context } from './context.js'
import { createGraphQLSchema } from './schema.js'

export type GraphQLClientConfig<ModelTypes extends ModelTypeAliases = ModelTypeAliases> = {
  cache?: TileCache | boolean
  ceramic: CeramicApi
  dataModel: DataModel<ModelTypes> | ModelTypesToAliases<ModelTypes>
  graphqlModel: GraphQLModel
  loader?: TileLoader
}

export class GraphQLClient<ModelTypes extends ModelTypeAliases = ModelTypeAliases> {
  #context: Context<ModelTypes>
  #schema: GraphQLSchema

  constructor(config: GraphQLClientConfig<ModelTypes>) {
    const { dataModel, graphqlModel, ...contextConfig } = config
    this.#context = new Context({ ...contextConfig, model: dataModel })
    this.#schema = createGraphQLSchema({ model: graphqlModel })
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
