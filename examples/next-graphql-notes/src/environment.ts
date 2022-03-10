import { CeramicClient } from '@ceramicnetwork/http-client'
import { GraphQLClient } from '@glazed/graphql'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { Environment as RelayEnvironment, Network, RecordSource, Store } from 'relay-runtime'
import type { GraphQLResponse } from 'relay-runtime'

import { graph } from './__generated__/model'

const CERAMIC_URL = process.env.NEXT_PUBLIC_CERAMIC_URL ?? 'https://ceramic-clay.3boxlabs.com'

export type Environment = {
  ceramic: CeramicClient
  did: DID
  relay: RelayEnvironment
}

export function createRelayEnvironment(ceramic: CeramicClient): RelayEnvironment {
  const client = GraphQLClient.fromGraph({ ceramic, graph })

  const network = Network.create(async (request, variables) => {
    const res = (await client.execute(request.text as string, variables)) as GraphQLResponse
    console.log('graphQL response', request, res)
    return res
  })

  return new RelayEnvironment({ network, store: new Store(new RecordSource()) })
}

export async function createEnvironment(seed: Uint8Array): Promise<Environment> {
  const did = new DID({
    provider: new Ed25519Provider(seed),
    resolver: getResolver(),
  })
  await did.authenticate()

  const ceramic = new CeramicClient(CERAMIC_URL)
  ceramic.did = did

  return { ceramic, did, relay: createRelayEnvironment(ceramic) }
}

export const defaultRelayEnvironment: RelayEnvironment = createRelayEnvironment(
  new CeramicClient(CERAMIC_URL)
)
