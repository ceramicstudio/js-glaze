import { Composite } from '@glazed/devtools'
import { Command, type CommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'
import fs from 'fs'

type Flags = CommandFlags & {
  outputPath?: string
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
    outputPath: Flags.string({
      char: 'o',
      description: 'path to the file where the composite representation should be saved',
    }),
  }

  async run(): Promise<void> {
    this.spinner.start('Creating the composite...')
    try {
      const schema = fs.readFileSync(this.args.schemaFilePath, 'utf8')
      const composite = await Composite.create({
        ceramic: this.ceramic,
        schema: schema,
        metadata: {
          controller: this.authenticatedDID.id,
        },
      })
      const encodedAsJSON = JSON.stringify(composite.toJSON(), null, 4)
      if (this.flags.outputPath === undefined) {
        this.spinner.succeed(encodedAsJSON)
      } else {
        fs.writeFile(this.flags.outputPath, encodedAsJSON, (err) => {
          if (err) {
            console.error(err)
            this.spinner.fail(err.message)
          } else {
            this.spinner.succeed(
              `Composite was created and its encoded representation was saved in ${this.flags.outputPath}`
            )
          }
        })
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
