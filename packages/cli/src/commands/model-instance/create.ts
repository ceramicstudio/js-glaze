import { Command, type CommandFlags } from '../../command.js'
import { ModelInstanceDocument } from '@ceramicnetwork/stream-model-instance'
import { StreamID } from '@ceramicnetwork/streamid';

export default class CreateModelInstance extends Command<
  CommandFlags,
  { model: string; content: string }
> {
  static description = ''

  static args = [
    {
      name: 'model',
      required: true,
      description: '',
    },
    {
      name: 'content',
      required: true,
      description: '',
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Creating the model instance...')
    try {
      const mid = await ModelInstanceDocument.create(this.ceramic, JSON.parse(this.args.content), {
        controller: this.authenticatedDID.id,
        model: StreamID.fromString(this.args.model),
      })
      this.spinner.succeed(`Created model instance with stream id: ${mid.id.toString()}`)
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
