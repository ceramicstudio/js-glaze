import { Composite } from '@glazed/devtools'
import { Command, type CommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'
import { writeEncodedComposite } from '@glazed/devtools-node'

type Flags = CommandFlags & {
  output?: string
}

export default class CompositeFromModel extends Command<Flags> {
  static strict = false

  static description = 'create a Composite from a list of model streams'

  static flags = {
    ...Command.flags,
    output: Flags.string({
      char: 'o',
      description: 'path to the file where the composite representation should be saved',
    }),
  }

  async run(): Promise<void> {
    this.spinner.start('Creating a composite from models...')
    const parsed = await this.parse(CompositeFromModel)
    const modelStreamIDs = parsed.raw
      .filter((token) => {
        return token.type === 'arg'
      })
      .map((token) => {
        return token.input
      })
    try {
      let modelStreamIDsFromSTDIN: Array<string> = []
      if (this.stdin !== undefined) {
        modelStreamIDsFromSTDIN = this.stdin.split(' ').map((streamID) => streamID.trim())
      }
      const allModelStreamIDs = [...modelStreamIDs, ...modelStreamIDsFromSTDIN]

      if (allModelStreamIDs.length === 0) {
        this.spinner.fail('Missing list of model streamIDs')
        return
      }
      const composite = await Composite.fromModels({
        ceramic: this.ceramic,
        models: allModelStreamIDs,
      })
      if (this.flags.output != null) {
        const output = this.flags.output
        await writeEncodedComposite(composite, output)
        this.spinner.succeed(
          `Creating a composite from models... Composite was created and its encoded representation was saved in ${output}`
        )
      } else {
        this.spinner.succeed('Creating a composite from models... Done!')
        // Logging the encoded representation to stdout, so that it can be piped using standard I/O or redirected to a file
        this.log(JSON.stringify(composite.toJSON()))
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
