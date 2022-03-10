import { CeramicClient } from '@ceramicnetwork/http-client'
import { ModelManager } from '@glazed/devtools'
import { writeEncodedModel, writeGraphQLSchema } from '@glazed/devtools-node'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays'

if (!process.env.SEED) {
  throw new Error('Missing SEED environment variable')
}

const CERAMIC_URL = process.env.CERAMIC_URL || 'https://ceramic-clay.3boxlabs.com'

// The seed must be provided as an environment variable
const seed = fromString(process.env.SEED, 'base16')
// Create and authenticate the DID
const did = new DID({
  provider: new Ed25519Provider(seed),
  resolver: getResolver(),
})
await did.authenticate()

// Connect to the local Ceramic node
const ceramic = new CeramicClient(CERAMIC_URL)
ceramic.did = did

// Create a manager for the model
const manager = new ModelManager({ ceramic })

// Create the schemas
const noteSchemaID = await manager.createSchema('Note', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Note',
  type: 'object',
  properties: {
    date: {
      type: 'string',
      format: 'date-time',
      title: 'date',
      maxLength: 30,
    },
    title: {
      type: 'string',
      title: 'text',
      maxLength: 100,
    },
    text: {
      type: 'string',
      title: 'text',
      maxLength: 4000,
    },
  },
})
const notesSchemaID = await manager.createSchema('Notes', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'NotesList',
  type: 'object',
  properties: {
    notes: {
      type: 'array',
      title: 'notes',
      items: {
        $comment: `cip88:ref:${manager.getSchemaURL(noteSchemaID)}`,
        type: 'string',
        pattern: '^ceramic://.+(\\?version=.+)?',
        maxLength: 150,
      },
    },
  },
})

// Create the definition using the created schema ID
await manager.createDefinition('notePad', {
  name: 'notes',
  description: 'Simple text notes',
  schema: manager.getSchemaURL(notesSchemaID),
})

// Create a Note with text that will be used as placeholder
await manager.createTile(
  'placeholderNote',
  { text: 'This is a placeholder for the note contents...' },
  { schema: manager.getSchemaURL(noteSchemaID) }
)

// Write model to JSON file
await writeEncodedModel(manager, new URL('../data/model.json', import.meta.url))
console.log('Encoded model written to data/model.json file')

await writeGraphQLSchema(manager, new URL('../data/schema.graphql', import.meta.url))
console.log('GraphQL schema written to data/schema.graphql file')
