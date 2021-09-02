import { randomBytes } from 'crypto'
import Ceramic from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { publishCollectionSchemas } from '@ceramicstudio/append-collection'
import { Context, createGraphQLSchema } from '@ceramicstudio/idx-graphql'
import { DocSet, publishIDXConfig } from '@ceramicstudio/idx-tools'
import { DID } from 'dids'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import type { GraphQLSchema } from 'graphql'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import KeyResolver from 'key-did-resolver'
import { fromString, toString } from 'uint8arrays'

function getSeed(): Uint8Array {
  const provided = process.env.SEED
  if (provided == null) {
    const bytes = randomBytes(32)
    const seed = new Uint8Array(bytes)
    console.log(`Using created seed: ${toString(seed, 'base16')}`)
    return seed
  }
  console.log('Using provided seed')
  return fromString(provided, 'base16')
}

function createDID(seed: Uint8Array): DID {
  return new DID({
    resolver: KeyResolver.getResolver(),
    provider: new Ed25519Provider(seed),
  })
}

async function initCeramic(did: DID): Promise<Ceramic> {
  const ceramic = new Ceramic()
  ceramic.did = did
  await Promise.all([did.authenticate(), publishIDXConfig(ceramic)])
  return ceramic
}

async function createSchema(ceramic: Ceramic): Promise<GraphQLSchema> {
  const PostSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Post',
    type: 'object',
    properties: {
      date: {
        type: 'string',
        format: 'date-time',
        maxLength: 30,
      },
      text: {
        type: 'string',
        maxLength: 4000,
      },
      title: {
        type: 'string',
        maxLength: 100,
      },
    },
    required: ['text', 'title'],
  }
  const postSchema = await TileDocument.create(ceramic, PostSchema)
  const postSchemaURL = postSchema.commitId.toUrl()
  const postRef = {
    type: 'string',
    title: 'reference',
    $comment: `cip88:ref:${postSchemaURL}`,
    maxLength: 100,
  }

  const postsCollectionSchemaCommitID = await publishCollectionSchemas(ceramic, 'Posts', [postRef])

  const BlogSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Blog',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        maxLength: 100,
      },
      posts: {
        type: 'string',
        $comment: `cip88:ref:${postsCollectionSchemaCommitID.toUrl()}`,
        maxLength: 100,
      },
    },
  }
  const blogSchema = await TileDocument.create(ceramic, BlogSchema)
  const blogSchemaURL = blogSchema.commitId.toUrl()

  const docset = new DocSet(ceramic)
  await Promise.all([
    docset.addDefinition(
      {
        name: 'blog',
        description: 'Awesome blog',
        schema: blogSchemaURL,
      },
      'myBlog'
    ),
    docset.addTile(
      'welcomePost',
      {
        date: '2020-12-10T11:12:34.567Z',
        text: 'Your can start writing posts now!',
        title: 'Welcome to your blog',
      },
      { schema: postSchemaURL }
    ),
  ])
  const graphqlDocSetRecords = await docset.toGraphQLDocSetRecords()
  return createGraphQLSchema(graphqlDocSetRecords)
}

async function startServer(ceramic: Ceramic, schema: GraphQLSchema): Promise<void> {
  const app = express()
  const context = new Context(ceramic)

  app.use('/graphql', graphqlHTTP({ schema, context, graphiql: true }))

  return new Promise((resolve, reject) => {
    app.on('error', reject)
    app.listen(4000, resolve)
  })
}

async function run() {
  const did = createDID(getSeed())
  const ceramic = await initCeramic(did)
  console.log('Connected to Ceramic')
  const schema = await createSchema(ceramic)
  console.log('Schema created')
  await startServer(ceramic, schema)
  console.log('Server started')
}

run().catch(console.error)
