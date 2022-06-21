import { Composite } from '@glazed/devtools'
import {Command, type CommandFlags, getArrayArg} from '../../command.js'
import { Flags } from '@oclif/core'
import fs from 'fs-extra'

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
    const modelStreamIDs = getArrayArg(this.argv, this.flags)

    if (modelStreamIDs.length === 0) {
      this.spinner.fail('Missing list of model streamIDs')
      return
    }

    this.spinner.start('Creating the composite...')
    try {
      const composite = await Composite.fromModels({
        ceramic: this.ceramic,
        models: modelStreamIDs,
      })
      const encodedAsJSON = JSON.stringify(composite.toJSON(), null, 2)
      if (this.flags.output !== undefined) {
        const output = this.flags.output
        await fs.writeFile(output, encodedAsJSON)
        this.spinner.succeed(
          `Composite was created and its encoded representation was saved in ${output}`
        )
      } else {
        this.spinner.succeed(encodedAsJSON)
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
