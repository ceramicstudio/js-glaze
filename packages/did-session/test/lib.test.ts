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
import { Wallet } from '@ethersproject/wallet'
import { SiweMessage, Cacao } from 'ceramic-cacao'
import { Model, ModelAccountRelation, ModelDefinition } from '@ceramicnetwork/stream-model'
import { ModelInstanceDocument } from '@ceramicnetwork/stream-model-instance'

const getModelDef = (name: string): ModelDefinition => ({
  name: name,
  accountRelation: ModelAccountRelation.LIST,
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    additionalProperties: false,
    properties: {
      myData: {
        type: 'integer',
        maximum: 10000,
        minimum: 0,
      },
    },
    required: ['myData'],
  },
})

const CONTENT0 = { myData: 0 }
const CONTENT1 = { myData: 1 }

const MODEL_DEFINITION = getModelDef('MyModel')

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

const bytes32 = [
  64, 168, 135, 95, 204, 113, 52, 90, 66, 192, 219, 241, 34, 128, 184, 176, 36, 249, 191, 223, 108,
  240, 6, 119, 226, 7, 81, 210, 31, 128, 182, 139,
]

const testResources = [
  '`ceramic://*?model=k2t6wyfsu4pfz0fnidk6tz3gak7tr8n5w34ah1c31w5vq98b62hir1pnn3j2ty',
  '`ceramic://*?model=k2t6wyfsu4pgz0ftx664veuaf2qib95zj8je2x7pf89v6g5p7xa7n9eo45g64a',
]

declare global {
  const ceramic: CeramicApi
}

describe('did-session', () => {
  let authProvider: EthereumAuthProvider
  jest.setTimeout(20000)
  const opts = { domain: 'myApp' }
  let model: Model

  beforeAll(async () => {
    authProvider = await createEthereumAuthProvider()
    model = await Model.create(ceramic, MODEL_DEFINITION)
  })

  const wallet = Wallet.fromMnemonic(
    'despair voyage estate pizza main slice acquire mesh polar short desk lyrics'
  )
  const address = wallet.address

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

  // Enable with next release
  test.skip('can create and update model instance stream', async () => {
    const session = new DIDSession({ authProvider, resources: [model.id.toString()] })
    const did = await session.authorize(opts)
    ceramic.did = did

    const doc = await ModelInstanceDocument.create(ceramic, CONTENT0, {
      model: model.id,
    })

    expect(doc.content).toEqual(CONTENT0)
    expect(doc.metadata.model.toString()).toEqual(model.id.toString())

    await doc.replace(CONTENT1)
    expect(doc.content).toEqual(CONTENT1)
  })

  test('isAuthorized/isExpired, with valid session and resources', async () => {
    const session = new DIDSession({ authProvider, resources: testResources })
    await session.authorize({ domain: 'myApp' })
    // Any session authorized and valid, true
    expect(session.isAuthorized()).toBe(true)
    expect(session.isExpired).toBe(false)
    // Authorized for given resources, true
    expect(session.isAuthorized(testResources)).toBe(true)
    // Authorized for wildcard resource, false
    expect(session.isAuthorized([`ceramic://*`])).toBe(false)
  })

  test('isAuthorized/isExpired, with expired session', async () => {
    // Expired 5 min ago
    const msg = new SiweMessage({
      domain: 'service.org',
      address: address,
      statement: 'I accept the ServiceOrg Terms of Service: https://service.org/tos',
      uri: 'did:key:z6MkrBdNdwUPnXDVD1DCxedzVVBpaGi8aSmoXFAeKNgtAer8',
      version: '1',
      nonce: '32891757',
      issuedAt: '2021-09-30T16:25:24.000Z',
      expirationTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      chainId: '1',
      resources: testResources,
    })

    const signature = await wallet.signMessage(msg.toMessage())
    msg.signature = signature
    const cacao = Cacao.fromSiweMessage(msg)

    const session = new DIDSession({ authProvider, cacao, keySeed: new Uint8Array(bytes32) })
    expect(session.isExpired).toBe(true)
    expect(session.isAuthorized()).toBe(false)
  })

  test('expiresInSecs, when session valid', async () => {
    // Expires in 5 mins
    const msg = new SiweMessage({
      domain: 'service.org',
      address: address,
      statement: 'I accept the ServiceOrg Terms of Service: https://service.org/tos',
      uri: 'did:key:z6MkrBdNdwUPnXDVD1DCxedzVVBpaGi8aSmoXFAeKNgtAer8',
      version: '1',
      nonce: '32891757',
      issuedAt: '2021-09-30T16:25:24.000Z',
      expirationTime: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
      chainId: '1',
      resources: testResources,
    })

    const signature = await wallet.signMessage(msg.toMessage())
    msg.signature = signature
    const cacao = Cacao.fromSiweMessage(msg)

    const session = new DIDSession({ authProvider, cacao, keySeed: new Uint8Array(bytes32) })

    // 5 sec buffer
    expect(session.expireInSecs).toBeGreaterThan(60 * 5 - 5)
    expect(session.expireInSecs).toBeLessThan(60 * 5 + 5)
  })

  test('expiresInSecs, when session expired', async () => {
    // Expired 5 min ago
    const msg = new SiweMessage({
      domain: 'service.org',
      address: address,
      statement: 'I accept the ServiceOrg Terms of Service: https://service.org/tos',
      uri: 'did:key:z6MkrBdNdwUPnXDVD1DCxedzVVBpaGi8aSmoXFAeKNgtAer8',
      version: '1',
      nonce: '32891757',
      issuedAt: '2021-09-30T16:25:24.000Z',
      expirationTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      chainId: '1',
      resources: testResources,
    })

    const signature = await wallet.signMessage(msg.toMessage())
    msg.signature = signature
    const cacao = Cacao.fromSiweMessage(msg)

    const session = new DIDSession({ authProvider, cacao, keySeed: new Uint8Array(bytes32) })

    expect(session.expireInSecs).toEqual(0)
  })

  describe('Manage session state', () => {
    test('serializes', async () => {
      const msg = new SiweMessage({
        domain: 'service.org',
        address: address,
        statement: 'I accept the ServiceOrg Terms of Service: https://service.org/tos',
        uri: 'did:key:z6MkrBdNdwUPnXDVD1DCxedzVVBpaGi8aSmoXFAeKNgtAer8',
        version: '1',
        nonce: '32891757',
        issuedAt: '2021-09-30T16:25:24.000Z',
        chainId: '1',
        resources: testResources,
      })

      const signature = await wallet.signMessage(msg.toMessage())
      msg.signature = signature
      const cacao = Cacao.fromSiweMessage(msg)

      const session = new DIDSession({ authProvider, cacao, keySeed: new Uint8Array(bytes32) })
      const sessionStr = session.serialize()
      expect(sessionStr).toMatchSnapshot()
    })

    test('roundtrip serialization, fromSession', async () => {
      const session = new DIDSession({ authProvider })
      await session.authorize(opts)
      const sessionStr = session.serialize()
      const session2 = DIDSession.fromSession(sessionStr, authProvider)
      const sessionStr2 = session2.serialize()
      expect(sessionStr).toEqual(sessionStr2)
    })
  })
})
