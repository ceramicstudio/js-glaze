const KeyResolver = require('@ceramicnetwork/key-did-resolver').default
const { DID } = require('dids')
const { Ed25519Provider } = require('key-did-provider-ed25519')
const { resolve } = require('path')
const fromString = require('uint8arrays/from-string')

const {
  createIDXSignedDefinitions,
  publishIDXSignedDefinitions,
  publishIDXSignedSchemas,
  signIDXSchemas,
} = require('../dist')
const { ceramic, logJSON, writeSigned } = require('./common')

const DEFINITIONS_PATH = resolve(__dirname, '../src/signed/definitions.json')
const SCHEMAS_PATH = resolve(__dirname, '../src/signed/schemas.json')

if (!process.env.SEED) {
  throw new Error('Missing SEED environment variable')
}

async function run() {
  const seed = fromString(process.env.SEED, 'base16')
  const did = new DID({ provider: new Ed25519Provider(seed), resolver: KeyResolver.getResolver() })
  await did.authenticate()

  const signedSchemas = await signIDXSchemas(did)
  console.log('Schemas signed')

  const publishedSchemas = await publishIDXSignedSchemas(ceramic, signedSchemas)
  console.log('Schemas published')
  logJSON(publishedSchemas)

  await writeSigned(SCHEMAS_PATH, signedSchemas)
  console.log(`Schemas written to ${SCHEMAS_PATH}`)

  const signedDefinitions = await createIDXSignedDefinitions(did, publishedSchemas)
  console.log('Definitions signed')

  const publishedDefinitions = await publishIDXSignedDefinitions(ceramic, signedDefinitions)
  console.log('Definitions published')
  logJSON(publishedDefinitions)

  await writeSigned(DEFINITIONS_PATH, signedDefinitions)
  console.log(`Definitions written to ${DEFINITIONS_PATH}`)

  process.exit(0)
}

run().catch(console.error)
