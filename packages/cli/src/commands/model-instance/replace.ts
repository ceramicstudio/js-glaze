import { Command, type CommandFlags, STREAM_ID_ARG } from '../../command.js'
import { ModelInstanceDocument } from '@ceramicnetwork/stream-model-instance'

export default class ModelInstanceReplace extends Command<
  CommandFlags,
  { streamId: string; content: any }
> {
  static description = 'replace content in a model instance stream'

  static args = [
    STREAM_ID_ARG,
    {
      name: 'content',
      required: true,
      description: 'New content of the model instance (JSON encoded as string)',
      parse: JSON.parse,
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Replacing content in the model instance...')
    try {
      const mid = await ModelInstanceDocument.load(this.ceramic, this.args.streamId)
      await mid.replace(this.args.content)
      this.spinner.succeed(
        `Replaced content in model instance with stream id: ${mid.id.toString()}`
      )
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
