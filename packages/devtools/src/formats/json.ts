import type { EncodedDagJWS, EncodedDagJWSResult } from '@glazed/types'
import type { DagJWS, DagJWSResult } from 'dids'
import { CID } from 'multiformats/cid'
import { fromString, toString } from 'uint8arrays'

import { applyMap } from '../utils.js'

/** @internal */
export function decodeDagJWS({ payload, signatures, link }: EncodedDagJWS): DagJWS {
  return { payload, signatures, link: link ? CID.parse(link) : undefined }
}

/** @internal */
export function encodeDagJWS({ payload, signatures, link }: DagJWS): EncodedDagJWS {
  return { payload, signatures, link: link?.toString() }
}

/** @internal */
export function decodeDagJWSResult({ jws, linkedBlock }: EncodedDagJWSResult): DagJWSResult {
  return { jws: decodeDagJWS(jws), linkedBlock: fromString(linkedBlock, 'base64pad') }
}

/** @internal */
export function encodeDagJWSResult({ jws, linkedBlock }: DagJWSResult): EncodedDagJWSResult {
  return { jws: encodeDagJWS(jws), linkedBlock: toString(linkedBlock, 'base64pad') }
}

/** @internal */
export function decodeSignedMap<K extends string>(
  data: Record<K, Array<EncodedDagJWSResult>>
): Record<K, Array<DagJWSResult>> {
  return applyMap(data, (records) => records.map(decodeDagJWSResult))
}

/** @internal */
export function encodeSignedMap<K extends string>(
  data: Record<K, Array<DagJWSResult>>
): Record<K, Array<EncodedDagJWSResult>> {
  return applyMap(data, (records) => records.map(encodeDagJWSResult))
}
