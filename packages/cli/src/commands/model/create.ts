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
    this.spinner.start('Creating the model...\n')
    try {
      const model = await Model.create(
        this.ceramic,
        JSON.parse(this.args.content) as ModelDefinition,
        {
          controller: this.authenticatedDID.id,
        }
      )
      this.log(model.id.toString())
      this.spinner.succeed('Done!')
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
