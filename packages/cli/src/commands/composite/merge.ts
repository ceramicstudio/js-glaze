import { Composite, CompositeOptions } from '@glazed/devtools'
import { Command, type CommandFlags, getArrayArg } from '../../command.js'
import { Flags } from '@oclif/core'
import fs from 'fs-extra'

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
    const compositePaths = getArrayArg(this.argv, this.flags)

    if (compositePaths.length === 0) {
      this.spinner.fail('Missing list of composite file paths')
      return
    }

    try {
      const composites = await Promise.all(
        compositePaths.map(async (compositePath) => {
          const encoded = await fs.readFile(compositePath, { encoding: 'utf-8' })
          return Composite.fromJSON({
            ceramic: this.ceramic,
            definition: JSON.parse(encoded),
          })
        })
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
      const encodedAsJSON = JSON.stringify(mergedComposite.toJSON(), null, 2)
      if (this.flags.output !== undefined) {
        const output = this.flags.output
        await fs.writeFile(output, encodedAsJSON)
        this.spinner.succeed(
          `Composite was created and its encoded representation was saved in ${output}`
        )
      } else {
        // Not using the spinner here, so that the output can be piped using standard I/O
        console.log(encodedAsJSON)
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
