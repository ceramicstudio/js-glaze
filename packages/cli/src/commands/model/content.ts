import { Model } from '@ceramicnetwork/stream-model'
import { Command, type QueryCommandFlags, STREAM_ID_ARG, SYNC_OPTION_FLAG } from '../../command.js'
import { Flags } from '@oclif/core'
import { write } from '../../fs.js'

type ModelContentFlags = QueryCommandFlags & {
  output?: string
}

export default class ModelContent extends Command<ModelContentFlags, { streamId: string }> {
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
    try {
      const model = await Model.load(this.ceramic, this.args.streamId)
      if (this.flags.output != null) {
        const output = this.flags.output
        await write(output, model.content)
        this.spinner.succeed(`Model's content was loaded and saved in ${output}`)
      } else {
        // Not using the spinner here, so that the output can be piped using standard I/O
        this.log(JSON.stringify(model.content))
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
