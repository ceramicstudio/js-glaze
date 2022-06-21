import { Command, type CommandFlags, STREAM_ID_ARG } from '../../command.js'
import { ModelInstanceDocument } from '@ceramicnetwork/stream-model-instance'

export default class ModelInstanceReplace extends Command<
  CommandFlags,
  { streamId: string; content: string }
> {
  static description = 'create a model instance stream from content encoded as JSON'

  static args = [
    STREAM_ID_ARG,
    {
      name: 'content',
      required: true,
      description: 'New content of the model instance (JSON encoded as string)',
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Replacing content in the model instance...')
    try {
      const mid = await ModelInstanceDocument.load(this.ceramic, this.args.streamId)
      await mid.replace(JSON.parse(this.args.content))
      this.spinner.succeed(
        `Replaced content in model instance with stream id: ${mid.id.toString()}`
      )
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
