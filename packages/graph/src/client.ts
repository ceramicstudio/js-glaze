import type { CeramicApi } from '@ceramicnetwork/common'
import { CeramicClient } from '@ceramicnetwork/http-client'
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
  ceramic: CeramicApi | string
  definition: RuntimeCompositeDefinition
  loader?: DocumentLoader
}

export class GraphClient {
  #context: Context
  #resources: Array<string>
  #schema: GraphQLSchema

  constructor(params: GraphClientParams) {
    const { ceramic, definition, ...contextParams } = params
    const ceramiClient = typeof ceramic === 'string' ? new CeramicClient(ceramic) : ceramic

    this.#context = new Context({ ...contextParams, ceramic: ceramiClient })
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
    document: DocumentNode,
    variableValues?: Record<string, unknown>
  ): Promise<ExecutionResult> {
    const errors = validate(this.#schema, document)
    return errors.length > 0
      ? { errors }
      : await execute({
          document,
          variableValues,
          contextValue: this.#context,
          schema: this.#schema,
        })
  }

  async executeQuery(
    source: string | Source,
    variableValues?: Record<string, unknown>
  ): Promise<ExecutionResult> {
    let document: DocumentNode
    try {
      document = parse(source)
    } catch (syntaxError) {
      return { errors: [syntaxError as GraphQLError] }
    }
    return await this.execute(document, variableValues)
  }
}
