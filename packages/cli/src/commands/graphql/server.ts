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
  { runtimeDefinitionPath: string | undefined }
> {
  static description = 'Load the graphQL schema from Composite '

  static args = [
    {
      name: 'runtimeDefinitionPath',
      required: false,
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
      const definitionPath = this.stdin || this.args.runtimeDefinitionPath
      if (definitionPath === undefined) {
        this.spinner.fail(
          'You need to pass a composite runtime definition path either as an argument or via stdin'
        )
        return
      }
      const definitionFile = await fs.readFile(definitionPath)
      const runtimeDefinition = JSON.parse(definitionFile.toString()) as RuntimeCompositeDefinition
      const handler = await serveGraphQL({
        ceramicURL: this.flags['ceramic-url'] || 'http://0.0.0.0:7007',
        definition: runtimeDefinition,
        readonly: this.flags.readonly,
        graphiql: this.flags.graphiql,
        port: this.flags.port,
      })
      this.spinner.info(`GraphQL server is listening on ${handler.url}`)
      process.on('SIGTERM', () => {
        handler.stop(() => {
          this.spinner.succeed('Server stopped')
        })
      })
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
