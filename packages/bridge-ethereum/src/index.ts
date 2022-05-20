/**
 * Ethereum bridge
 *
 * @module bridge-ethereum
 */

import { type CapabilityOpts, EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import type { CeramicApi } from '@ceramicnetwork/common'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { DIDSession } from '@glazed/did-session'
import { GraphQLClient } from '@glazed/graphql'
import type { RuntimeCompositeDefinition } from '@glazed/types'
import type { ExecutionResult, Source } from 'graphql'

export type EthereumBridgeParams = {
  authProvider: EthereumAuthProvider
  ceramic: CeramicApi | string
  definition: RuntimeCompositeDefinition
}

export class EthereumBridge {
  #client: GraphQLClient
  #resources: Array<string>
  #session: DIDSession

  // TODO: fromEthereumProvider() using an EthereumProvider and creating the authProvider

  constructor(params: EthereumBridgeParams) {
    const ceramic =
      typeof params.ceramic === 'string' ? new CeramicClient(params.ceramic) : params.ceramic
    this.#client = GraphQLClient.fromDefinition({ ceramic, definition: params.definition })
    this.#resources = Object.values(params.definition.models).map((modelID) => {
      // TODO: is this the right syntax?
      return `ceramic://*?model=${modelID}`
    })
    this.#session = new DIDSession({ authProvider: params.authProvider })
  }

  get id(): string {
    return this.#session.id
  }

  async authorize(options: CapabilityOpts = {}): Promise<string> {
    const did = await this.#session.authorize({ resources: this.#resources, ...options })
    this.#client.context.ceramic.did = did
    return did.id
  }

  async execute(
    source: string | Source,
    variables?: Record<string, unknown>
  ): Promise<ExecutionResult> {
    return await this.#client.execute(source, variables)
  }
}
