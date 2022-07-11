import { Command, type CommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'
import { readEncodedComposite, writeEncodedComposite } from '@glazed/devtools-node'
import { Composite } from '@glazed/devtools'
import { EncodedCompositeDefinition } from '@glazed/types'

type Flags = CommandFlags & {
  output?: string
}

export default class CompositeExtractModel extends Command<Flags> {
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
    const parsed = await this.parse(CompositeExtractModel)
    const allArgs = parsed.raw
      .filter((token) => {
        return token.type === 'arg'
      })
      .map((token) => {
        return token.input
      })
    try {
      let composite: Composite | undefined = undefined
      let modelsToExtract: Array<string> = []
      if (this.stdin !== undefined && allArgs.length >= 1) {
        const definition = JSON.parse(this.stdin) as EncodedCompositeDefinition
        composite = await Composite.fromJSON({ ceramic: this.ceramic, definition })
        modelsToExtract = allArgs
      } else if (this.stdin === undefined && allArgs.length >= 2) {
        composite = await readEncodedComposite(this.ceramic, allArgs[0])
        modelsToExtract = allArgs.splice(1)
      } else if (this.stdin !== undefined && allArgs.length < 1) {
        this.spinner.fail(
          'When the composite is passed as JSON in stdin, at least one model to extract needs to be passed as param'
        )
        return
      } else {
        this.spinner.fail('Missing composite path and at least one model to extract')
        return
      }
      const newComposite = composite.copy(modelsToExtract)

      if (this.flags.output != null) {
        const output = this.flags.output
        await writeEncodedComposite(newComposite, output)
        this.spinner.succeed(
          `Composite was created and its encoded representation was saved in ${output}`
        )
      } else {
        // Not using the spinner here, so that the output can be piped using standard I/O
        this.log(JSON.stringify(newComposite.toJSON()))
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
