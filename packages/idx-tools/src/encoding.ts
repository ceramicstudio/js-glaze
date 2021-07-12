import CID from 'cids'
import type { DagJWS, DagJWSResult } from 'dids'
import { fromString, toString } from 'uint8arrays'

import type { EncodedDagJWS, EncodedDagJWSResult } from './types'
import { applyMap } from './utils'

export function decodeDagJWS({ payload, signatures, link }: EncodedDagJWS): DagJWS {
  return { payload, signatures, link: link ? new CID(link) : undefined }
}

export function encodeDagJWS({ payload, signatures, link }: DagJWS): EncodedDagJWS {
  return { payload, signatures, link: link?.toString() }
}

export function decodeDagJWSResult({ jws, linkedBlock }: EncodedDagJWSResult): DagJWSResult {
  return { jws: decodeDagJWS(jws), linkedBlock: fromString(linkedBlock, 'base64pad') }
}

export function encodeDagJWSResult({ jws, linkedBlock }: DagJWSResult): EncodedDagJWSResult {
  return { jws: encodeDagJWS(jws), linkedBlock: toString(linkedBlock, 'base64pad') }
}

export function decodeSignedMap<K extends string>(
  data: Record<K, Array<EncodedDagJWSResult>>
): Record<K, Array<DagJWSResult>> {
  return applyMap(data, (records) => records.map(decodeDagJWSResult))
}

export function encodeSignedMap<K extends string>(
  data: Record<K, Array<DagJWSResult>>
): Record<K, Array<EncodedDagJWSResult>> {
  return applyMap(data, (records) => records.map(encodeDagJWSResult))
}
