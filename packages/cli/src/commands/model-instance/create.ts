import { Command, type CommandFlags } from '../../command.js'
import { ModelInstanceDocument } from '@ceramicnetwork/stream-model-instance'
import { StreamID } from '@ceramicnetwork/streamid'

export default class CreateModelInstance extends Command<
  CommandFlags,
  { model: StreamID; content: any }
> {
  static description = 'create a model instance stream from content encoded as JSON'

  static args = [
    {
      name: 'model',
      required: true,
      description: 'StreamID of the model whose instance is being created',
      parse: StreamID.fromString,
    },
    {
      name: 'content',
      required: true,
      description: 'Content of the created model instance (JSON encoded as string)',
      parse: JSON.parse,
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Creating the model instance...')
    try {
      const mid = await ModelInstanceDocument.create(this.ceramic, this.args.content, {
        controller: this.authenticatedDID.id,
        model: this.args.model,
      })
      this.spinner.succeed(`Created model instance with stream id: ${mid.id.toString()}`)
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
