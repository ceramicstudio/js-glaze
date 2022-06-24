import { Command, type CommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'
import { readEncodedComposite, writeEncodedComposite } from '@glazed/devtools-node'

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

    if (allArgs.length < 2) {
      this.spinner.fail('Missing composite path and at least one model to extract')
      return
    }
    try {
      const [compositePath, ...modelsToExtract] = allArgs

      const composite = await readEncodedComposite(this.ceramic, compositePath)
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
