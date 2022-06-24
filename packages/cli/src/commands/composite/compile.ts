import { Command, type CommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'
import { readEncodedComposite, writeRuntimeDefinition } from '@glazed/devtools-node'

type Flags = CommandFlags & {
  output?: string
}

export default class CompositeCompile extends Command<Flags> {
  static strict = false

  static description = 'create a runtime representation of a composite'

  async run(): Promise<void> {
    const parsed = await this.parse(CompositeCompile)
    const allArgs = parsed.raw
      .filter((token) => {
        return token.type === 'arg'
      })
      .map((token) => {
        return token.input
      })

    if (allArgs.length < 2) {
      this.spinner.fail('Missing composite path and at output path')
      return
    }
    try {
      const compositePath = allArgs[0]
      const outputPaths = allArgs.splice(1)
      const composite = await readEncodedComposite(this.ceramic, compositePath)
      const runtimeDefinition = composite.toRuntime()
      outputPaths.map(async (outputPath) => {
        await writeRuntimeDefinition(runtimeDefinition, outputPath)
      })
      this.spinner.succeed('Successfully saved compiled composite into given path(s)')
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
