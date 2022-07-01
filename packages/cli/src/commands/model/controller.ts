import { Model } from '@ceramicnetwork/stream-model'
import { Command, type QueryCommandFlags, STREAM_ID_ARG, SYNC_OPTION_FLAG } from '../../command.js'

export default class ModelController extends Command<QueryCommandFlags, { streamId: string }> {
  static description = 'load a model stream with a given stream id and display its controller'

  static args = [STREAM_ID_ARG]

  static flags = {
    ...Command.flags,
    sync: SYNC_OPTION_FLAG,
  }

  async run(): Promise<void> {
    this.spinner.start('Loading the model...')
    try {
      const model = await Model.load(this.ceramic, this.args.streamId)
      this.spinner.succeed(
        `Model's content was loaded. It's controller is ${model.metadata.controllers[0].toString()}`
      )
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}