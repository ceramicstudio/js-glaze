import { Command, CommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'
import fs from 'fs-extra'
import { printGraphQLSchema } from '@glazed/graph'
import { writeGraphQLSchema } from '@glazed/devtools-node'
import { RuntimeCompositeDefinition } from '@glazed/types'

type GraphQLSchemaFlags = CommandFlags & {
  output?: string
  readonly?: boolean
}

export default class GraphQLSchema extends Command<
  GraphQLSchemaFlags,
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
    output: Flags.string({
      char: 'o',
      description: 'path to the file where the composite representation should be saved',
    }),
    readonly: Flags.boolean({
      description: 'a boolean flag indicating whether the output schema should be readonly',
    }),
  }

  async run(): Promise<void> {
    try {
      const definitionFile = await fs.readFile(this.args.runtimeDefinitionPath)
      const runtimeDefinition = JSON.parse(definitionFile.toString()) as RuntimeCompositeDefinition
      if (this.flags.output != null) {
        await writeGraphQLSchema(runtimeDefinition, this.flags.output, this.flags.readonly)
        this.spinner.succeed(`The schema was saved in ${this.flags.output}`)
      } else {
        // Logging the schema to stdout, so that it can be piped using standard I/O or redirected to a file
        this.log(printGraphQLSchema(runtimeDefinition, this.flags.readonly))
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
