import { Command, type CommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'
import { readEncodedComposite, writeRuntimeDefinition } from '@glazed/devtools-node'
import { Composite } from '@glazed/devtools'
import { EncodedCompositeDefinition } from '@glazed/types'

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
    try {
      let composite: Composite | undefined = undefined
      let outputPaths: Array<string> = []
      if (this.stdin !== undefined && allArgs.length >= 1) {
        const definition = JSON.parse(this.stdin) as EncodedCompositeDefinition
        composite = await Composite.fromJSON({ ceramic: this.ceramic, definition })
        outputPaths = allArgs
      } else if (this.stdin === undefined && allArgs.length >= 2) {
        composite = await readEncodedComposite(this.ceramic, allArgs[0])
        outputPaths = allArgs.splice(1)
      } else if (this.stdin !== undefined && allArgs.length < 1) {
        this.spinner.fail(
          'When the composite is passed as JSON in stdin, at least one output path needs to be given as param'
        )
        return
      } else {
        this.spinner.fail('Missing composite path and at output path')
        return
      }
      const runtimeDefinition = composite.toRuntime()
      outputPaths.map(async (outputPath) => {
        await writeRuntimeDefinition(runtimeDefinition, outputPath)
      })
      let logged = false
      if (!this.flags['disable-stdin']) {
        outputPaths.forEach((path) => {
          if (path.endsWith('.json')) {
            // log the first .json path so that it can be piped e.g. to graphql:server
            this.log(path)
            logged = true
            return
          }
        })
      }
      if (!logged) {
        this.log('Runtime representation(s) saved')
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
