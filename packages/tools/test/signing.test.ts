/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import KeyResolver from '@ceramicnetwork/key-did-resolver'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { fromString } from 'uint8arrays'

import { schemas, signTile, signIDXDefinitions, signIDXSchemas } from '../src'

describe('signing', () => {
  const DagJWSResult = expect.objectContaining({
    jws: expect.any(Object),
    linkedBlock: expect.any(Uint8Array),
  })
  const Records = expect.arrayContaining([DagJWSResult])

  const seed = fromString(
    '08b2e655d239e24e3ca9aa17bc1d05c1dee289d6ebf0b3542fd9536912d51ee0',
    'base16'
  )
  let did: DID
  beforeAll(async () => {
    did = new DID({ provider: new Ed25519Provider(seed), resolver: KeyResolver.getResolver() })
    await did.authenticate()
  })

  it('signTile', async () => {
    const tile = await signTile(did, { hello: 'test' })
    expect(tile).toEqual(DagJWSResult)
  })

  it('signIDXDefinitions', async () => {
    const signed = await signIDXDefinitions(did, 'ceramic://definitionId', {
      first: {
        name: 'First definition',
        schema: 'ceramic://first',
      },
      second: {
        name: 'Second definition',
        schema: 'ceramic://second',
      },
    })
    expect(signed).toEqual({
      first: Records,
      second: Records,
    })
  })

  it('signIDXSchemas', async () => {
    const expected = Object.keys(schemas).reduce((acc, name) => {
      acc[name] = Records
      return acc
    }, {})
    const signed = await signIDXSchemas(did)
    expect(signed).toEqual(expected)
  })
})
