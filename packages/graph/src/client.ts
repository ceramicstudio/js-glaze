import type { CeramicApi } from '@ceramicnetwork/common'
import type { RuntimeCompositeDefinition } from '@glazed/types'
import type { DID } from 'dids'
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

export type GraphClientParams = {
  cache?: DocumentCache | boolean
  ceramic: CeramicApi
  definition: RuntimeCompositeDefinition
  loader?: DocumentLoader
}

export class GraphClient {
  #context: Context
  #resources: Array<string>
  #schema: GraphQLSchema

  constructor(params: GraphClientParams) {
    const { definition, ...contextParams } = params
    this.#context = new Context(contextParams)
    this.#resources = Object.values(definition.models).map((modelID) => {
      return `ceramic://*?model=${modelID}`
    })
    this.#schema = createGraphQLSchema({ definition })
  }

  get context(): Context {
    return this.#context
  }

  get did(): DID | undefined {
    return this.#context.ceramic.did
  }

  get id(): string | undefined {
    return this.did?.id
  }

  get resources(): Array<string> {
    return this.#resources
  }

  setDID(did: DID): void {
    this.#context.ceramic.did = did
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
