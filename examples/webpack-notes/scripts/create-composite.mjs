import { CeramicClient } from '@ceramicnetwork/http-client'
import { createComposite, writeEncodedComposite } from '@glazed/devtools-node'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays'

if (!process.env.SEED) {
  throw new Error('Missing SEED environment variable')
}

// The seed must be provided as an environment variable
const seed = fromString(process.env.SEED, 'base16')
// Create and authenticate the DID
const did = new DID({
  provider: new Ed25519Provider(seed),
  resolver: getResolver(),
})
await did.authenticate()

// Connect to the local Ceramic node
const ceramic = new CeramicClient('http://localhost:7007')
ceramic.did = did

// Create composite from schema
const composite = await createComposite(
  ceramic,
  new URL('../data/src/schema.graphql', import.meta.url)
)

// Display models for Ceramic node config
const models = Object.keys(composite.toParams().definition.models)
console.log(`Composite models: ${JSON.stringify(models)}`)

// Write encoded definition
const compositePath = new URL('../data/src/composite.json', import.meta.url)
await writeEncodedComposite(composite, compositePath)
console.log('Encoded model written to data/src/composite.json file')

// Write runtime file and schema
await writeEncodedCompositeRuntime(
  client,
  compositePath,
  new URL('../src/__generated__/definition.ts', import.meta.url),
  new URL('../data/schema.graphql', import.meta.url)
)
console.log('Runtime files successfully written')
