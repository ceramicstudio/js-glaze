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

    if (compositePaths.length === 0) {
      this.spinner.fail('Missing list of composite file paths')
      return
    }

    try {
      this.spinner.start('Merging composites...')
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
      if (this.flags.output != null) {
        const output = this.flags.output
        await writeEncodedComposite(mergedComposite, output)
        this.spinner.succeed(
          `Composite was created and its encoded representation was saved in ${output}`
        )
      } else {
        this.spinner.succeed('Merging composites... Done!')
        // Logging the encoded representation to stdout, so that it can be piped using standard I/O or redirected to a file
        this.log(JSON.stringify(mergedComposite.toJSON()))
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
