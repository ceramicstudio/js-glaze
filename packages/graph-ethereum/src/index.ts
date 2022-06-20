/**
 * Graph Ethereum client
 *
 * @module graph-ethereum
 */

import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import type { GraphClientParams } from '@glazed/graph'
import { GraphSession } from '@glazed/graph-session'

export type RequestArguments = {
  method: string
  params?: Array<unknown> | Record<string, any>
}

export type EIP1193Provider = {
  request<Result = unknown>(req: RequestArguments): Promise<Result>
}

export type FromProviderParams = GraphClientParams & {
  provider: EIP1193Provider
}

export async function createAuthProvider(provider: EIP1193Provider): Promise<EthereumAuthProvider> {
  const [account] = await provider.request<Array<string>>({ method: 'eth_requestAccounts' })
  if (account == null) {
    throw new Error('Could not access Ethereum account')
  }
  return new EthereumAuthProvider(provider, account)
}

export class GraphEthereum extends GraphSession {
  static async fromProvider(params: FromProviderParams): Promise<GraphSession> {
    const { provider, ...sessionParams } = params
    const authProvider = await createAuthProvider(provider)
    return new GraphSession({ ...sessionParams, authProvider })
  }

  async setProvider(provider: EIP1193Provider, account?: string) {
    const authProvider =
      account == null
        ? await createAuthProvider(provider)
        : new EthereumAuthProvider(provider, account)
    this.setAuthProvider(authProvider)
  }

  async authorize(provider?: EIP1193Provider, account?: string): Promise<string> {
    if (provider != null) {
      await this.setProvider(provider, account)
    }
    return await super.authorize()
  }
}
