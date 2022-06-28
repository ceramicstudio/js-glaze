import { CeramicClient } from '@ceramicnetwork/http-client'
import { Context, createGraphQLSchema } from '@glazed/graph'
import type { RuntimeCompositeDefinition } from '@glazed/types'
import type { DID } from 'dids'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import getPort from 'get-port'

import { readEncodedComposite } from './fs.js'
import type { PathInput } from './types.js'

export type ServerHandler = {
  /**
   * URL of the local GraphQL endpoint.
   */
  url: string
  /**
   * Stop the server.
   */
  stop: (callback?: (err?: Error | undefined) => void) => void
}

export type ServeParams = {
  /**
   * URL of the Ceramic node.
   */
  ceramicURL: string
  /**
   * Optional DID instance attached to the Ceramic client.
   */
  did?: DID
  /**
   * Enable GraphiQL on the server.
   */
  graphiql?: boolean
  /**
   * Port to use, if available.
   */
  port?: number | Array<number>
}

export type ServeDefinitionParams = ServeParams & {
  /**
   * Path of the encoded composite definition used to generate the GraphQL schema.
   */
  path: PathInput
}

export type ServeGraphQLParams = ServeParams & {
  /**
   * Runtime composite definition used to generate the GraphQL schema.
   */
  definition: RuntimeCompositeDefinition
  readonly?: boolean
}

/**
 * Create a local GraphQL server to interact with a runtime composite definition.
 */
export async function serveGraphQL(params: ServeGraphQLParams): Promise<ServerHandler> {
  const { ceramicURL, definition, readonly, did, graphiql, port } = params
  const ceramic = new CeramicClient(ceramicURL)
  if (did != null) {
    ceramic.did = did
  }

  const app = express()
  app.use(
    '/graphql',
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    graphqlHTTP({
      context: new Context({ ceramic }),
      schema: createGraphQLSchema({ definition, readonly }),
      graphiql,
    })
  )

  const serverPort = await getPort({ port })

  return await new Promise((resolve, reject) => {
    const server = app.listen(serverPort, () => {
      const handler: ServerHandler = {
        url: `http://localhost:${serverPort}/graphql`,
        stop: (callback) => {
          server.close(callback)
        },
      }
      resolve(handler)
    })
    server.once('error', reject)
  })
}

/**
 * Create a local GraphQL server to interact with an encoded composite definition.
 */
export async function serveEncodedDefinition(
  params: ServeDefinitionParams
): Promise<ServerHandler> {
  const { path, ...rest } = params
  const composite = await readEncodedComposite(params.ceramicURL, path)
  return await serveGraphQL({ ...rest, definition: composite.toRuntime() })
}
