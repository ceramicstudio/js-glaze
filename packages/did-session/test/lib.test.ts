/**
 * @jest-environment glaze
 */
import type { CeramicApi } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { EventEmitter } from 'events'
import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import { Wallet as EthereumWallet } from '@ethersproject/wallet'
import { fromString, toString } from 'uint8arrays'
import { DIDSession } from '../src'
import { jest } from '@jest/globals'

class EthereumProvider extends EventEmitter {
  wallet: EthereumWallet

  constructor(wallet: EthereumWallet) {
    super()
    this.wallet = wallet
  }

  send(
    request: { method: string; params: Array<any> },
    callback: (err: Error | null | undefined, res?: any) => void
  ): void {
    if (request.method === 'eth_chainId') {
      callback(null, { result: '1' })
    } else if (request.method === 'personal_sign') {
      let message = request.params[0] as string
      if (message.startsWith('0x')) {
        message = toString(fromString(message.slice(2), 'base16'), 'utf8')
      }
      callback(null, { result: this.wallet.signMessage(message) })
    } else {
      callback(new Error(`Unsupported method: ${request.method}`))
    }
  }
}

function createEthereumAuthProvider(mnemonic?: string): Promise<EthereumAuthProvider> {
  const wallet = mnemonic ? EthereumWallet.fromMnemonic(mnemonic) : EthereumWallet.createRandom()
  const provider = new EthereumProvider(wallet)
  return Promise.resolve(new EthereumAuthProvider(provider, wallet.address))
}

declare global {
  const ceramic: CeramicApi
}

describe('did-session', () => {
  let authProvider: EthereumAuthProvider
  jest.setTimeout(20000)
  const opts = { domain: 'myApp' }

  beforeAll(async () => {
    authProvider = await createEthereumAuthProvider()
  })

  test('creates did-session', () => {
    const session = new DIDSession({ authProvider })
    expect(session.authProvider).toBe(authProvider)
  })

  test('did getter throws error when not authorized', () => {
    const session = new DIDSession({ authProvider })
    expect(() => session.getDID()).toThrow('DID not available, has not authorized')
  })

  test('did getter returns when authorized', async () => {
    const session = new DIDSession({ authProvider })
    const did = await session.authorize(opts)
    expect(did).toBeTruthy()
    expect(session.getDID()).toBeTruthy()
  })

  test('authorize, default wildcard', async () => {
    const session = new DIDSession({ authProvider })
    const did = await session.authorize(opts)
    expect(did.capability.p.resources.includes(`ceramic://*`)).toBe(true)
  })

  test('authorize, with streamid resources', async () => {
    const session = new DIDSession({ authProvider })
    const streamId = `ceramic://z6MkhZCWzHtPFmpNupVPuHA6svtpKKY9RUpgf9uohnhFMNvj`
    const did = await session.authorize({ resources: [streamId], domain: 'myApp' })
    expect(did.capability.p.resources.includes(streamId)).toBe(true)
  })

  test('authorize and create/update streams', async () => {
    const session = new DIDSession({ authProvider })
    const did = await session.authorize(opts)
    ceramic.did = did
    const doc = await TileDocument.create(
      ceramic,
      { foo: 'bar' },
      {},
      {
        anchor: false,
        publish: false,
      }
    )
    expect(doc.content).toEqual({ foo: 'bar' })

    await doc.update({ foo: 'boo' })
    expect(doc.content).toEqual({ foo: 'boo' })
  })
})
