import { serveEncodedDefinition } from '@glazed/devtools-node'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays'

let did
if (process.env.SEED) {
  const seed = fromString(process.env.SEED, 'base16')
  did = new DID({
    provider: new Ed25519Provider(seed),
    resolver: getResolver(),
  })
  await did.authenticate()
}

const server = await serveEncodedDefinition({
  ceramicURL: 'http://localhost:7007',
  did,
  graphiql: true,
  path: new URL('../data/src/composite.json', import.meta.url),
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
})

console.log(`Server started on ${server.url}`)

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server stopped')
  })
})
