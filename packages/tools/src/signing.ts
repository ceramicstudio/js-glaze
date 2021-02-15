import type DocID from '@ceramicnetwork/docid'
import type { DagJWSResult, DID } from 'dids'

import * as schemas from './schemas'
import type { Definition, SignedSchemas, Schema } from './types'
import { docIDToString, promiseMap } from './utils'

export async function signTile<T = unknown>(
  did: DID,
  data: T,
  schema?: DocID | string
): Promise<DagJWSResult> {
  if (!did.authenticated) {
    throw new Error('DID must be authenticated')
  }

  const header = {
    controllers: [did.id],
    schema: schema ? docIDToString(schema) : undefined,
  }
  return await did.createDagJWS({ data, doctype: 'tile', header }, { did: did.id })
}

export async function signIDXDefinitions(
  did: DID,
  definitionSchema: DocID | string,
  definitions: Record<string, Definition>
): Promise<Record<string, Array<DagJWSResult>>> {
  const schema = docIDToString(definitionSchema)
  return await promiseMap(definitions, async (definition: Definition) => {
    return [await signTile(did, definition, schema)]
  })
}

export async function signIDXSchemas(did: DID): Promise<SignedSchemas> {
  return await promiseMap(schemas, async (schema: Schema) => {
    return [await signTile(did, schema)]
  })
}
