import type { CeramicApi } from '@ceramicnetwork/common'
import type { DataModel } from '@glazed/datamodel'
import type { TileCache, TileLoader } from '@glazed/tile-loader'
import type { GraphModel, ModelTypeAliases, ModelTypesToAliases } from '@glazed/types'
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
import { graphModelToAliases } from './utils.js'

export type FromGraphParams = {
  ceramic: CeramicApi
  graph: GraphModel
}

export type GraphQLClientParams<ModelTypes extends ModelTypeAliases = ModelTypeAliases> = {
  cache?: TileCache | boolean
  ceramic: CeramicApi
  loader?: TileLoader
  model: DataModel<ModelTypes> | ModelTypesToAliases<ModelTypes>
  schema: GraphQLSchema
}

export class GraphQLClient<ModelTypes extends ModelTypeAliases = ModelTypeAliases> {
  #context: Context<ModelTypes>
  #schema: GraphQLSchema

  static fromGraph<ModelTypes extends ModelTypeAliases = ModelTypeAliases>({
    ceramic,
    graph,
  }: FromGraphParams): GraphQLClient<ModelTypes> {
    return new GraphQLClient<ModelTypes>({
      ceramic,
      model: graphModelToAliases<ModelTypes>(graph),
      schema: createGraphQLSchema({ model: graph }),
    })
  }

  constructor(params: GraphQLClientParams<ModelTypes>) {
    const { schema, ...contextParams } = params
    this.#context = new Context(contextParams)
    this.#schema = schema
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
