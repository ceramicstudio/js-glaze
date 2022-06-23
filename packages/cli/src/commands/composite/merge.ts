import { Composite, CompositeOptions } from '@glazed/devtools'
import { Command, type CommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'
import { readEncodedComposite, writeEncodedComposite } from '@glazed/devtools-node'

type Flags = CommandFlags & {
  output?: string
}

export default class CompositeMerge extends Command<Flags> {
  static strict = false

  static description = 'create a Composite from other composites'

  static flags = {
    ...Command.flags,
    'common-embeds': Flags.string({
      char: 'e',
      description: `'all','none' or a list of comma-separated embeds to extract from input composites into the output composite`,
    }),
    output: Flags.string({
      char: 'o',
      description: 'path to the file where the composite representation should be saved',
    }),
  }

  async run(): Promise<void> {
    const parsed = await this.parse(CompositeMerge)
    const compositePaths = parsed.raw
      .filter((token) => {
        return token.type === 'arg'
      })
      .map((token) => {
        return token.input
      })

    try {
      const composites = await Promise.all(
        compositePaths.map(async (path) => await readEncodedComposite(this.ceramic, path))
      )

      const commonEmbedsFlag = this.flags['common-embeds'] as string | undefined
      let compositeOptions: CompositeOptions = {}
      if (commonEmbedsFlag) {
        compositeOptions = {
          commonEmbeds: ['all', 'none'].includes(commonEmbedsFlag)
            ? commonEmbedsFlag
            : commonEmbedsFlag.split(','),
        }
      }

      const mergedComposite = Composite.from(composites, compositeOptions)
      if (this.flags.output !== undefined) {
        const output = this.flags.output
        await writeEncodedComposite(Composite.from(composites), output)
        this.spinner.succeed(
          `Composite was created and its encoded representation was saved in ${output}`
        )
      } else {
        // Not using the spinner here, so that the output can be piped using standard I/O
        console.log(JSON.stringify(mergedComposite.toJSON(), null, 2))
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
