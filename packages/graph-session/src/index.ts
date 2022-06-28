/**
 * Graph session client
 *
 * @module graph-session
 */

import type { AuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import { DIDSession } from '@glazed/did-session'
import { GraphClient, type GraphClientParams } from '@glazed/graph'

export type GraphSessionParams = GraphClientParams & {
  authProvider: AuthProvider
}

export class GraphSession extends GraphClient {
  #session: DIDSession

  constructor(params: GraphSessionParams) {
    const { authProvider, ...clientParams } = params
    super(clientParams)
    // The authProvider type in DIDSession is set to EthereumAuthProvider, but we just use the
    // generic interface here
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.#session = new DIDSession({ authProvider: authProvider as any })
  }

  get session(): DIDSession {
    return this.#session
  }

  setAuthProvider(provider: AuthProvider): DIDSession {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.#session = new DIDSession({ authProvider: provider as any })
    return this.#session
  }

  async authorize(): Promise<string> {
    const did = await this.#session.authorize({ resources: this.resources })
    this.context.ceramic.did = did
    return did.id
  }
}
