import chalk from 'chalk'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { write } from '../../fs'

type Args = {
  name: string
  output: string
}

export default class ExportModel extends Command<CommandFlags, Args> {
  static description = 'export a model'

  static flags = Command.flags

  static args = [
    { name: 'name', description: 'local model name or package', required: true },
    { name: 'output', description: 'JSON file to output the model to', required: false },
  ]

  async run(): Promise<void> {
    this.spinner.start('Exporting model...')
    try {
      const { name, output } = this.args
      const manager = await this.getModelManager(name)
      await write(output, manager.toJSON())
      this.spinner.succeed(`Model successfully exported to ${chalk.green(output)}`)
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
