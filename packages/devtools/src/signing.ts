import type { StreamID } from '@ceramicnetwork/streamid'
import type { DagJWSResult, DID } from 'dids'

import { streamIDToString } from './utils'

export async function signTile<T = unknown>(
  did: DID,
  data: T,
  schema?: StreamID | string
): Promise<DagJWSResult> {
  if (!did.authenticated) {
    throw new Error('DID must be authenticated')
  }

  const header = {
    controllers: [did.id],
    schema: schema ? streamIDToString(schema) : undefined,
  }
  return await did.createDagJWS({ data, doctype: 'tile', header }, { did: did.id })
}
