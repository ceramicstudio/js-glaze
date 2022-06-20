import { Composite } from '@glazed/devtools'
import { Command, type CommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'
import fs from 'mz/fs.js'

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
    this.spinner.start('Creating the composite...')
    try {
      const schema = await fs.readFile(this.args.schemaFilePath, { encoding: 'utf-8' })
      const composite = await Composite.create({
        ceramic: this.ceramic,
        schema: schema,
        metadata: {
          controller: this.authenticatedDID.id,
        },
      })
      const encodedAsJSON = JSON.stringify(composite.toJSON(), null, 4)
      if (this.flags.output !== undefined) {
        const output = this.flags.output
        await fs.writeFile(output, encodedAsJSON)
        this.spinner.succeed(
          `Composite was created and its encoded representation was saved in ${output}`
        )
      } else {
        this.spinner.succeed(encodedAsJSON)
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}