import { Model, ModelDefinition } from '@ceramicnetwork/stream-model'
import { Command, type CommandFlags } from '../../command.js'

export default class CreateModel extends Command<CommandFlags, { content: string }> {
  static description = 'create a model stream from content encoded as JSON'

  static args = [
    {
      name: 'content',
      required: true,
      description: 'Model content (JSON encoded as string)',
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Creating the model...')
    try {
      const model = await Model.create(
        this.ceramic,
        JSON.parse(this.args.content) as ModelDefinition,
        {
          controller: this.authenticatedDID.id,
        }
      )
      this.spinner.succeed(`Created ${model.content.name} with streamID ${model.id.toString()}`)
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
