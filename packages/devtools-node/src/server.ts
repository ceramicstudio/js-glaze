import { CeramicClient } from '@ceramicnetwork/http-client'
import { Context, createGraphQLSchema } from '@glazed/graphql'
import type { RuntimeCompositeDefinition } from '@glazed/types'
import type { DID } from 'dids'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import getPort from 'get-port'

import { readEncodedComposite } from './fs.js'
import type { PathInput } from './types.js'

export type ServerInfo = {
  url: string
  stop: () => void
}

export type ServeParams = {
  ceramicURL: string
  did?: DID
  graphiql?: boolean
  port?: number | Array<number>
}

export type ServeDefinitionParams = ServeParams & {
  path: PathInput
}

export type ServeGraphQLParams = ServeParams & {
  definition: RuntimeCompositeDefinition
}

export async function serveGraphQL({
  ceramicURL,
  definition,
  did,
  graphiql,
  port,
}: ServeGraphQLParams): Promise<ServerInfo> {
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
      schema: createGraphQLSchema({ definition }),
      graphiql,
    })
  )

  const serverPort = await getPort({ port })

  return await new Promise((resolve, reject) => {
    const server = app.listen(serverPort, () => {
      resolve({
        url: `http://localhost:${serverPort}/graphql`,
        stop: () => {
          server.close()
        },
      })
    })
    server.once('error', reject)
  })
}

export async function serveEncodedDefinition({
  path,
  ...params
}: ServeDefinitionParams): Promise<ServerInfo> {
  const composite = await readEncodedComposite(params.ceramicURL, path)
  return await serveGraphQL({ ...params, definition: composite.toRuntime() })
}
