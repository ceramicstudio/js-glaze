import chalk from 'chalk'

import { Command, type CommandFlags } from '../../command.js'
import { write } from '../../fs.js'

type Args = {
  name: string
  output?: string
}

export default class DeployModel extends Command<CommandFlags, Args> {
  static description = 'deploy a model'

  static flags = Command.flags

  static args = [
    { name: 'name', description: 'local model name or package', required: true },
    {
      name: 'output',
      description: 'JSON file to output the deployed model aliases',
      required: false,
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Deploying model...')
    try {
      const { name, output } = this.args

      const manager = await this.getModelManager(name)
      const aliases = await manager.deploy()

      if (output == null) {
        this.spinner.succeed('Model successfully deployed')
      } else {
        await write(output, aliases)
        this.spinner.succeed(
          `Model successfully deployed and aliases written to ${chalk.green(output)}`
        )
      }
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
