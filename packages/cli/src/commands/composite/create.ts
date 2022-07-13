import { Command, type CommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'
import { createComposite, writeEncodedComposite } from '@glazed/devtools-node'

type Flags = CommandFlags & {
  output?: string
}

export default class CreateComposite extends Command<Flags, { schemaFilePath: string }> {
  static description =
    'create a Composite (a list of Model Streams) from a graphQL Schema Definition Language definition'

  static args = [
    {
      name: 'schemaFilePath',
      required: true,
      description: 'A graphQL SDL definition of the Composite encoded as a string',
    },
  ]

  static flags = {
    ...Command.flags,
    output: Flags.string({
      char: 'o',
      description: 'path to the file where the composite representation should be saved',
    }),
  }

  async run(): Promise<void> {
    try {
      this.spinner.start('Creating the composite...')
      const composite = await createComposite(this.ceramic, this.args.schemaFilePath)
      if (this.flags.output != null) {
        const output = this.flags.output
        await writeEncodedComposite(composite, output)
        this.spinner.succeed(
          `Creating the composite... Done! The encoded representation was saved in ${output}`
        )
      } else {
        this.spinner.succeed('Creating the composite... Done!')
        // Logging the encoded representation to stdout, so that it can be piped using standard I/O or redirected to a file
        this.log(JSON.stringify(composite.toJSON()))
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
