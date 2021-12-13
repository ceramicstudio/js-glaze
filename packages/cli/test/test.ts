import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { randomBytes } from 'crypto'
import { fromString, toString } from 'uint8arrays'

import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import KeyDidResolver from 'key-did-resolver'

export const ceramic = new CeramicClient('http://localhost:7007')

const keyDidResolver = KeyDidResolver.getResolver()
const threeIdResolver = ThreeIdResolver.getResolver(ceramic)
const resolver = {
  ...threeIdResolver,
  ...keyDidResolver,
}

export let globalKey: string

export const makeDID = async (): Promise<{ DID: DID; key: string }> => {
  const seed = new Uint8Array(randomBytes(32))
  const did = new DID({ provider: new Ed25519Provider(seed), resolver })

  try {
    await did.authenticate()
    globalKey = toString(seed, 'base16')
    return { DID: did, key: toString(seed, 'base16') }
  } catch (e) {
    throw new Error('Could not authenticate DID')
  }
}

export const createTile = async () => {
  if (!globalKey) {
    await makeDID()
  }
  const did = new DID({
    resolver: resolver,
    provider: new Ed25519Provider(fromString(globalKey, 'base16')),
  })
  await did.authenticate()
  await ceramic.setDID(did)
  const metadata = {
    controllers: [did.id],
  }

  const document = await TileDocument.create(ceramic, { foo: 'bar' }, metadata)
  return document
}
