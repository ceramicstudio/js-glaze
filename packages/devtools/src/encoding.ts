import type { EncodedDagJWS, EncodedDagJWSResult, ManagedEntry, ManagedModel } from '@glazed/types'
import CID from 'cids'
import type { DagJWS, DagJWSResult } from 'dids'
import { fromString, toString } from 'uint8arrays'

import { applyMap } from './utils'

/** @internal */
export function decodeDagJWS({ payload, signatures, link }: EncodedDagJWS): DagJWS {
  return { payload, signatures, link: link ? new CID(link) : undefined }
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

/** @internal */
export function decodeEntryCommits(
  entry: ManagedEntry<EncodedDagJWSResult>
): ManagedEntry<DagJWSResult> {
  return { ...entry, commits: entry.commits.map(decodeDagJWSResult) }
}

/** @internal */
export function decodeModel(model: ManagedModel<EncodedDagJWSResult>): ManagedModel<DagJWSResult> {
  return {
    schemas: applyMap(model.schemas, (schema) => {
      return { ...schema, commits: schema.commits.map(decodeDagJWSResult) }
    }),
    definitions: applyMap(model.definitions, decodeEntryCommits),
    tiles: applyMap(model.tiles, decodeEntryCommits),
  }
}

/** @internal */
export function encodeEntryCommits(
  entry: ManagedEntry<DagJWSResult>
): ManagedEntry<EncodedDagJWSResult> {
  return { ...entry, commits: entry.commits.map(encodeDagJWSResult) }
}

/** @internal */
export function encodeModel(model: ManagedModel<DagJWSResult>): ManagedModel<EncodedDagJWSResult> {
  return {
    schemas: applyMap(model.schemas, (schema) => {
      return { ...schema, commits: schema.commits.map(encodeDagJWSResult) }
    }),
    definitions: applyMap(model.definitions, encodeEntryCommits),
    tiles: applyMap(model.tiles, encodeEntryCommits),
  }
}
