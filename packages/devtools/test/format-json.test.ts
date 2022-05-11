/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { CID } from 'multiformats/cid'

import {
  decodeDagJWS,
  encodeDagJWS,
  decodeDagJWSResult,
  encodeDagJWSResult,
  decodeSignedMap,
  encodeSignedMap,
} from '../src'

describe('JSON encoding', () => {
  const cid = CID.parse('bafybeig6xv5nwphfmvcnektpnojts33jqcuam7bmye2pb54adnrtccjlsu')
  const dagJWS = {
    payload: 'payload',
    signatures: [{ protected: 'protected', signature: 'signature' }],
    link: cid,
  }
  const dagJWSResult = {
    jws: dagJWS,
    linkedBlock: new Uint8Array(32),
  }

  it('encodes and decodes DagJWS', () => {
    const encoded = encodeDagJWS(dagJWS)
    const decoded = decodeDagJWS(encoded)
    expect(decoded).toEqual(dagJWS)
  })

  it('encodes and decodes DagJWSResult', () => {
    const encoded = encodeDagJWSResult(dagJWSResult)
    const decoded = decodeDagJWSResult(encoded)
    expect(decoded).toEqual(dagJWSResult)
  })

  it('encodes and decodes signed map', () => {
    const signedMap = { res: [dagJWSResult] }
    const encoded = encodeSignedMap(signedMap)
    const decoded = decodeSignedMap(encoded)
    expect(decoded).toEqual(signedMap)
  })
})
