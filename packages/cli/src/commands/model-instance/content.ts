import { ModelInstanceDocument } from '@ceramicnetwork/stream-model-instance'
import { Command, type QueryCommandFlags, STREAM_ID_ARG, SYNC_OPTION_FLAG } from '../../command.js'
import { Flags } from '@oclif/core'
import { write } from '../../fs.js'

type ModelContentFlags = QueryCommandFlags & {
  output?: string
}

export default class ModelInstanceContent extends Command<ModelContentFlags, { streamId: string }> {
  static description =
    'load a model stream instance with a given stream id and display its contents'

  static args = [STREAM_ID_ARG]

  static flags = {
    ...Command.flags,
    output: Flags.string({
      char: 'o',
      description: 'path to the file where the model instance content should be saved',
    }),

    sync: SYNC_OPTION_FLAG,
  }

  async run(): Promise<void> {
    try {
      const mid = await ModelInstanceDocument.load(this.ceramic, this.args.streamId)
      const midContentAsJSON = JSON.stringify(mid.content)
      if (this.flags.output != null) {
        const output = this.flags.output
        await write(output, midContentAsJSON)
        this.spinner.succeed(`Model instance's content was loaded and saved in ${output}`)
      } else {
        // Not using the spinner here, so that the output can be piped using standard I/O
        this.log(midContentAsJSON)
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
