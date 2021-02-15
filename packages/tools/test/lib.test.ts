/**
 * @jest-environment ceramic
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import KeyResolver from '@ceramicnetwork/key-did-resolver'
import {
  definitions as publishedDefinitions,
  schemas as publishedSchemas,
} from '@ceramicstudio/idx-constants'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { fromString } from 'uint8arrays'

import {
  createIDXSignedDefinitions,
  publishIDXConfig,
  publishIDXSignedDefinitions,
  publishIDXSignedSchemas,
  signIDXSchemas,
} from '..'

describe('lib', () => {
  const DocID = expect.stringMatching(/^[0-9a-z]+$/) as jest.Expect
  const DocURL = expect.stringMatching(/^ceramic:\/\/[0-9a-z]+$/) as jest.Expect
  const DagJWSResult = expect.objectContaining({
    jws: expect.any(Object),
    linkedBlock: expect.any(Uint8Array),
  })
  const Records = expect.arrayContaining([DagJWSResult])

  test('publish config', async () => {
    jest.setTimeout(20000)

    const config = await publishIDXConfig(ceramic)
    expect(config).toEqual({
      definitions: publishedDefinitions,
      schemas: publishedSchemas,
    })
  })

  test('signing and publishing flow', async () => {
    jest.setTimeout(20000)

    const seed = fromString(
      '08b2e655d239e24e3ca9aa17bc1d05c1dee289d6ebf0b3542fd9536912d51ee0',
      'base16'
    )
    const did = new DID({
      provider: new Ed25519Provider(seed),
      resolver: KeyResolver.getResolver(),
    })
    await did.authenticate()

    // First sign all the schemas using the DID
    const signedSchemas = await signIDXSchemas(did)
    expect(signedSchemas).toEqual({
      BasicProfile: Records,
      CryptoAccounts: Records,
      Definition: Records,
      IdentityIndex: Records,
      ThreeIdKeychain: Records,
    })

    // Publish the signed schemas to Ceramic, no need to be the authoring DID
    const schemas = await publishIDXSignedSchemas(ceramic, signedSchemas)
    expect(schemas).toEqual({
      BasicProfile: DocURL,
      CryptoAccounts: DocURL,
      Definition: DocURL,
      IdentityIndex: DocURL,
      ThreeIdKeychain: DocURL,
    })

    // Create and sign the definitions, we need the published schemas DocIDs for this
    const signedDefinitions = await createIDXSignedDefinitions(did, publishedSchemas)
    expect(signedDefinitions).toEqual({
      basicProfile: Records,
      cryptoAccounts: Records,
      threeIdKeychain: Records,
    })

    // Publish the definitions to Ceramic
    const definitions = await publishIDXSignedDefinitions(ceramic, signedDefinitions)
    expect(definitions).toEqual({
      basicProfile: DocID,
      cryptoAccounts: DocID,
      threeIdKeychain: DocID,
    })
  })
})
