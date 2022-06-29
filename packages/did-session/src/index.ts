/**
 * Manages user account and DID in web based environments.
 *
 * ## Purpose
 *
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
 * Create an instance, authorize and use DIDs where needed. At the moment, only Ethereum accounts
 * are supported with the EthereumAuthProvider. Additional accounts will be supported in the future.
 *
 * ```ts
 * import { DIDSession } from '@glazed/did-session'
 * import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
 *
 * const ethProvider = // import/get your web3 eth provider
 * const addresses = await ethProvider.enable()
 * const authProvider = new EthereumAuthProvider(ethProvider, addresses[0])
 *
 * const session = new DIDSession({ authProvider })
 * const did = await session.authorize()
 *
 * // Uses DIDs in ceramic & glaze libraries, ie
 * const ceramic = new CeramicClient()
 * ceramic.did = did
 *
 * // pass ceramic instance where needed
 *
 * ```
 *
 * You can serialize a session to store for later and then re-initialize. Currently sessions are valid
 * for 1 day by default.
 *
 *```ts
 * // Create session as above, store for later
 * const session = new DIDSession({ authProvider })
 * const did = await session.authorize()
 * const sessionString = session.serialize()
 *
 * // write/save session string where you want (ie localstorage)
 * // ...
 *
 * // Later re initialize session
 * const session2 = DIDSession.fromSession(authProvider, sessionString)
 * const ceramic = new CeramicClient()
 * ceramic.did = session2.getDID()
 * ```
 *
 * Additional helper functions are available to help you manage a session lifecycle and the user experience.
 *
 *  *```ts
 * // Check if authorized or created from existing session string
 * didsession.hasSession
 *
 * // Check if session expired
 * didsession.isExpired
 *
 * // Get resources session is authorized for
 * didsession.authorizations
 *
 * // Check number of seconds till expiration, may want to re auth user at a time before expiration
 * didsession.expiresInSecs
 *
 * @module did-session
 */

import { Ed25519Provider } from 'key-did-provider-ed25519'
import KeyDidResolver from 'key-did-resolver'
import { randomBytes } from '@stablelib/random'
import { DID } from 'dids'
import type { EthereumAuthProvider, CapabilityOpts } from '@ceramicnetwork/blockchain-utils-linking'
import type { Cacao } from 'ceramic-cacao'
import * as u8a from 'uint8arrays'

export type SessionParams = {
  /**
   * An authProvider for the chain you wish to support, only ETH supported at moment
   */
  authProvider: EthereumAuthProvider
  resources?: Array<string>
  keySeed?: Uint8Array
  cacao?: Cacao
}

type SessionObj = {
  sessionKeySeed: string
  cacao: Cacao
}

export async function createDIDKey(seed?: Uint8Array): Promise<DID> {
  const didProvider = new Ed25519Provider(seed || randomBytes(32))
  const didKey = new DID({
    provider: didProvider,
    resolver: KeyDidResolver.getResolver(),
  })
  await didKey.authenticate()
  return didKey
}

export function JSONToBase64url(object: Record<string, any>): string {
  return u8a.toString(u8a.fromString(JSON.stringify(object)), 'base64url')
}

export function base64urlToJSON(s: string): Record<string, any> {
  return JSON.parse(u8a.toString(u8a.fromString(s, 'base64url'))) as Record<string, any>
}

export function bytesToBase64(b: Uint8Array): string {
  return u8a.toString(b, 'base64pad')
}

export function base64ToBytes(s: string): Uint8Array {
  return u8a.fromString(s, 'base64pad')
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
  #resources: Array<string>
  #did?: DID
  #keySeed?: Uint8Array
  #cacao?: Cacao

  constructor(params: SessionParams) {
    this.#authProvider = params.authProvider
    this.#keySeed = params.keySeed
    this.#cacao = params.cacao
    this.#resources = params.resources ?? [`ceramic://*`]
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
  async authorize(capabilityOpts: CapabilityOpts = {}): Promise<DID> {
    this.#keySeed = randomBytes(32)
    const didKey = await createDIDKey(this.#keySeed)
    // Pass through opts resources instead, resource arg does not support anything but streamids at moment
    const opts = Object.assign({ resources: this.#resources }, capabilityOpts)
    this.#cacao = await this.#authProvider.requestCapability(didKey.id, [], opts)
    return this.initDID(didKey, this.#cacao)
  }

  async initDID(didKey: DID, cacao: Cacao): Promise<DID> {
    const didWithCap = didKey.withCapability(cacao)
    await didWithCap.authenticate()
    this.#did = didWithCap
    return didWithCap
  }

  /**
   * Get DID instance, if authorized
   */
  getDID(): DID {
    if (!this.#did) {
      throw new Error('DID not available, has not authorized')
    }
    return this.#did
  }

  /**
   * Serialize session into string, can store and initalize the same session again while valid
   */
  serialize(): string {
    if (!this.#keySeed || !this.#cacao) throw new Error('No session to seralize')
    const session = {
      sessionKeySeed: bytesToBase64(this.#keySeed),
      cacao: this.#cacao,
    }
    return JSONToBase64url(session)
  }

  /**
   * Initialize a session from a serialized session string
   */
  static async fromSession(
    session: string,
    authProvider: EthereumAuthProvider
  ): Promise<DIDSession> {
    const { sessionKeySeed, cacao } = base64urlToJSON(session) as SessionObj
    const dsession = new DIDSession({ authProvider, cacao, keySeed: base64ToBytes(sessionKeySeed) })
    const didKey = await createDIDKey(dsession.#keySeed)
    await dsession.initDID(didKey, cacao)
    return dsession
  }

  get hasSession(): boolean {
    return !!this.#cacao && !!this.#did
  }

  /**
   * Determine if a session is expired or not
   */
  get isExpired(): boolean {
    if (!this.#cacao) throw new Error('No session available')
    const expTime = this.#cacao.p.exp
    if (!expTime) return false
    return Date.parse(expTime) < Date.now()
  }

  /**
   * Number of seconds until a session expires
   */
  get expireInSecs(): number {
    if (!this.#cacao) throw new Error('No session available')
    const expTime = this.#cacao.p.exp
    if (!expTime) throw new Error('Session does not expire')
    const timeDiff = Date.parse(expTime) - Date.now()
    return timeDiff < 0 ? 0 : timeDiff / 1000
  }

  /**
   * Get the list of resources a session is authorized for
   */
  get authorizations(): Array<string> {
    return this.#cacao?.p.resources ?? []
  }

  /**
   * Get the session CACAO
   */
  get cacao(): Cacao {
    if (!this.#cacao) throw new Error('No session available')
    return this.#cacao
  }

  /**
   * Determine if session is available and optionally if authorized for given resources
   */
  isAuthorized(resources?: Array<string>): boolean {
    if (!this.hasSession || this.isExpired) return false
    if (!resources) return true
    return resources.every((val) => this.authorizations.includes(val))
  }

  /** DID string associated to the session instance. session.id == session.getDID().parent */
  get id(): string {
    if (!this.#did) {
      throw new Error('ID not available, has not authorized')
    }
    return this.#did.parent
  }
}
