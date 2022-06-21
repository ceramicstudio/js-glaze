import { ModelInstanceDocument } from '@ceramicnetwork/stream-model-instance'
import { Command, type QueryCommandFlags, STREAM_ID_ARG, SYNC_OPTION_FLAG } from '../../command.js'
import { Flags } from '@oclif/core'
import fs from 'fs-extra'

type ModelContentFlags = QueryCommandFlags & {
  output?: string
}

export default class ModelInstanceContent extends Command<ModelContentFlags, { streamId: string }> {
  static description = 'load a model stream with a given stream id and display its contents'

  static args = [STREAM_ID_ARG]

  static flags = {
    ...Command.flags,
    output: Flags.string({
      char: 'o',
      description: 'path to the file where the composite representation should be saved',
    }),

    sync: SYNC_OPTION_FLAG,
  }

  async run(): Promise<void> {
    this.spinner.start('Loading the model...')
    try {
      const mid = await ModelInstanceDocument.load(this.ceramic, this.args.streamId)
      const midContentAsJSON = JSON.stringify(mid.content, null, 2)
      if (this.flags.output !== undefined) {
        const output = this.flags.output
        await fs.writeFile(output, midContentAsJSON)
        this.spinner.succeed(`Model's content was loaded and saved in ${output}`)
      } else {
        this.spinner.succeed(midContentAsJSON)
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
