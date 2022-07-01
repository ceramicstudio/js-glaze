import { serveGraphQL } from '@glazed/devtools-node'
import { Command, CommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'
import fs from 'fs-extra'
import { RuntimeCompositeDefinition } from '@glazed/types'

type GraphQLServerFlags = CommandFlags & {
  readonly?: boolean
  port?: number
  graphiql?: boolean
}

export default class GraphQLServer extends Command<
  GraphQLServerFlags,
  { runtimeDefinitionPath: string }
> {
  static description = 'Load the graphQL schema from Composite '

  static args = [
    {
      name: 'runtimeDefinitionPath',
      required: true,
      description: 'ID of the stream',
    },
  ]

  static flags = {
    ...Command.flags,
    readonly: Flags.boolean({
      description: 'a boolean flag indicating whether the output schema should be readonly',
    }),
    port: Flags.integer({
      description: 'port for the GraphQL server to listen on',
    }),
    graphiql: Flags.boolean({
      description: 'enable support for GraphiQL endpoint',
    }),
  }

  async run(): Promise<void> {
    try {
      const definitionFile = await fs.readFile(this.args.runtimeDefinitionPath)
      const runtimeDefinition = JSON.parse(definitionFile.toString()) as RuntimeCompositeDefinition
      const handler = await serveGraphQL({
        ceramicURL: this.flags.ceramic || 'http://0.0.0.0:7007',
        definition: runtimeDefinition,
        readonly: this.flags.readonly,
        graphiql: this.flags.graphiql,
        port: this.flags.port,
      })
      this.log(`GraphQL server is listening on ${handler.url}`)
      process.on('SIGTERM', () => {
        handler.stop(() => {
          this.log('Server stopped')
        })
      })
    } catch (e) {

      this.spinner.fail((e as Error).message)
      return
    }
  }
}
