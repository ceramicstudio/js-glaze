import type { CeramicApi } from '@ceramicnetwork/common'
import type { RuntimeCompositeDefinition } from '@glazed/types'
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
import type { DocumentCache, DocumentLoader } from './loader.js'
import { createGraphQLSchema } from './schema.js'

export type FromDefinitionParams = {
  ceramic: CeramicApi
  definition: RuntimeCompositeDefinition
}

export type GraphQLClientParams = {
  cache?: DocumentCache | boolean
  ceramic: CeramicApi
  loader?: DocumentLoader
  schema: GraphQLSchema
}

export class GraphQLClient {
  #context: Context
  #schema: GraphQLSchema

  static fromDefinition({ ceramic, definition }: FromDefinitionParams): GraphQLClient {
    return new GraphQLClient({ ceramic, schema: createGraphQLSchema({ definition }) })
  }

  constructor(params: GraphQLClientParams) {
    const { schema, ...contextParams } = params
    this.#context = new Context(contextParams)
    this.#schema = schema
  }

  get context(): Context {
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
