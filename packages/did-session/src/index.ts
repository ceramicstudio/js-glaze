/**
 * Manages, creates and authorizes a DID session key for a user. Returns an authenticated DIDs instance
 * to be used in other Ceramic libraries. Supports did:pkh for blockchain accounts with Sign-In with 
 * Ethereum and CACAO for authorization. 
 *
 * ## Installation
 *
 * ```sh
 * npm install @glazed/did-session
 * ```
 *
 * ## Usage
 * 
 * Create an instance, authorize and use DIDs where needed.
 *
 * ```ts
 * import { DIDSession } from '@glazed/did-session'
 * import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
 * 
 * const ethProvider = // import/get your web3 eth provider
 * const addresses = await ethProvider.enable()
 * const authProvider = new EthereumAuthProvider(ethProvider, addresses[0])
 * 
 * const session = await DIDSession.create({ authProvider })
 * const did = await session.authorize() 
 * 
 * // Uses DIDs in ceramic & glaze libraries, ie 
 * const ceramic = new CeramicClient()
 * ceramic.did = did
 * 
 * ```
 *
 * @module did-session
 */

import { Ed25519Provider } from "key-did-provider-ed25519"
import  KeyDidResolver  from "key-did-resolver"
import { randomBytes } from "@stablelib/random"
import { DID } from "dids"
import type { EthereumAuthProvider } from "@ceramicnetwork/blockchain-utils-linking"

export type SessionParams = {
  /**
   * An authProvider for the chain you wish to support, only ETH supported at moment
   */
  authProvider: EthereumAuthProvider
}

export async function createDIDKey(seed?: Uint8Array):Promise<DID> {
    const didProvider = new Ed25519Provider(seed || randomBytes(32))
    const didKey = new DID({
        provider: didProvider,
        resolver: KeyDidResolver.getResolver()
    })
    await didKey.authenticate()
    return didKey
}

/**
 * DID Session 
 *
 * ```sh
 * import { DIDSession } from '@glazed/did-session'
 * ```
 */
export class DIDSession {
  #authProvider: EthereumAuthProvider
  #did?: DID

  constructor(params: SessionParams) {
    // this.#ceramic = params.ceramic 
    this.#authProvider = params.authProvider
  }

  /**
   * Create a DID session instance
   */
  static async create(params: SessionParams): Promise<DIDSession> {
    return new DIDSession(params)
  }

  /**
   * Get authProvider
   */
  get authProvider() {
    return this.#authProvider
  }

  /**
   * Request authorization for session
   */
  async authorize(resources?: Array<string>): Promise<DID> {
    const didKey = await createDIDKey()
    const _resources = resources || [`ceramic://*`]
    console.log(didKey.id)
    // Pass through opts resources instead, resource arg does not support anything but streamids at moment
    const cacao = await this.#authProvider.requestCapability(didKey.id, [], {domain: 'myapp', resources: _resources})
    const didWithCap = didKey.withCapability(cacao);
    await didWithCap.authenticate()
    this.#did = didWithCap
    return didWithCap
  }

  /**
   * Get DID instance, if authorized
   */
  getDID(): DID {
    if (!this.#did) {
      throw new Error('DID not availale, has not authorized')
    }
    return this.#did
  }
}
