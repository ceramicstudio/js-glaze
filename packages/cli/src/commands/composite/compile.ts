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
      const [compositePath, ...outputPaths] = allArgs
      const composite = await readEncodedComposite(this.ceramic, compositePath)
      const runtimeDefinition = composite.toRuntime()
      outputPaths.map(async (outputPath) => {
        await writeRuntimeDefinition(runtimeDefinition, outputPath)
      })
      let logged = false
      outputPaths.forEach((path) => {
        if (path.endsWith('.json')) {
          // log the first .json path so that it can be piped e.g. to graphql:server
          this.log(path)
          logged = true
          return
        }
      })
      if (!logged) {
        this.log('Runtime representation(s) saved')
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
