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
import type { DocumentCache } from './loader.js'
import { createGraphQLSchema } from './schema.js'

export type GraphClientParams = {
  /**
   * Optional cache for documents.
   */
  cache?: DocumentCache | boolean
  /**
   * Ceramic client instance or HTTP URL.
   */
  ceramic: CeramicApi | string
  /**
   * Runtime composite definition, created using the {@linkcode devtools.Composite Composite}
   * development tools.
   */
  definition: RuntimeCompositeDefinition
}

/**
 * The GraphClient class provides APIs to execute queries on a GraphQL schema generated from a
 * {@linkcode types.RuntimeCompositeDefinition RuntimeCompositeDefinition}. It allows applications
 * to interact with documents using known models on a Ceramic node.
 *
 * It is exported by the {@linkcode graph} module.
 *
 * ```sh
 * import { GraphClient } from '@glazed/graph'
 * ```
 */
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

  /**
   * Context instance used internally.
   */
  get context(): Context {
    return this.#context
  }

  /**
   * DID instance used internally by the Ceramic client instance.
   */
  get did(): DID | undefined {
    return this.#context.ceramic.did
  }

  /**
   * ID of the DID attached to the Ceramic client instance used internally. If `undefined`, the
   * Ceramic instance is not authenticated and mutations will fail.
   */
  get id(): string | undefined {
    return this.did?.id
  }

  /**
   * CACAO resources URLs for the models the client interacts with.
   */
  get resources(): Array<string> {
    return this.#resources
  }

  /**
   * Attach the given DID instance to the Ceramic client instance used internally. An authenticated
   * DID instance is necessary to perform GraphQL mutations.
   */
  setDID(did: DID): void {
    this.#context.ceramic.did = did
  }

  /**
   * Execute a GraphQL query from a DocumentNode and optional variables.
   */
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

  /**
   * Execute a GraphQL query from its source and optional variables.
   */
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
