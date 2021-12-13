import { Ed25519Provider } from 'key-did-provider-ed25519'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { DID } from 'dids'
import { Resolver } from 'did-resolver'
import { randomBytes } from 'crypto'

import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import KeyDidResolver from 'key-did-resolver'
import { TileDocument } from '@ceramicnetwork/stream-tile'

export const ceramic = new CeramicClient('http://localhost:7007')

export const makeDID = async () => {
  const keyDidResolver = KeyDidResolver.getResolver()
  const threeIdResolver = ThreeIdResolver.getResolver(ceramic)
  const resolver = new Resolver({
    ...threeIdResolver,
    ...keyDidResolver,
  })

  const seed = new Uint8Array(randomBytes(32))
  const did = new DID({ provider: new Ed25519Provider(seed), resolver })
  await did.authenticate()
  return { DID: did, key: seed.toString() }
}
