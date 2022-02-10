import chalk from 'chalk'

import { Command, type CommandFlags } from '../../command.js'
import { write } from '../../fs.js'

type Args = {
  name: string
  output?: string
}

export default class PublishModel extends Command<CommandFlags, Args> {
  static description = 'publish a model'

  static flags = Command.flags

  static args = [
    { name: 'name', description: 'local model name or package', required: true },
    { name: 'output', description: 'JSON file to output the published aliases', required: false },
  ]

  async run(): Promise<void> {
    this.spinner.start('Publishing model...')
    try {
      const { name, output } = this.args

      const manager = await this.getModelManager(name)
      const published = await manager.toPublished()

      if (output == null) {
        this.spinner.succeed('Model successfully published')
      } else {
        await write(output, published)
        this.spinner.succeed(`Model successfully published and written to ${chalk.green(output)}`)
      }
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
