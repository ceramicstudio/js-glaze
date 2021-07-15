/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import CID from 'cids'

import {
  decodeDagJWS,
  encodeDagJWS,
  decodeDagJWSResult,
  encodeDagJWSResult,
  decodeSignedMap,
  encodeSignedMap,
} from '../src'

describe('encoding', () => {
  const cid = new CID('mAXASIOnrbGCADfkPyOI37VMkbzluh1eaukBqqnl2oFaFnuIt')
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
