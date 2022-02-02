import { Flags } from '@oclif/core'
import fs from 'fs-extra'
import inquirer from 'inquirer'

import { Command, type CommandFlags } from '../../command.js'
import { config } from '../../config.js'

interface Flags extends CommandFlags {
  force?: boolean
}

export default class DeleteModel extends Command<Flags, { name: string }> {
  static description = 'delete a local model'

  static flags = {
    ...Command.flags,
    force: Flags.boolean({ char: 'f', description: 'bypass confirmation prompt' }),
  }

  static args = [{ name: 'name', required: true }]

  async run(): Promise<void> {
    try {
      const { name } = this.args
      const models = config.get('models')
      if (models[name] == null) {
        this.spinner.warn(`Model ${name} does not exist`)
        return
      }

      let confirmed = !!this.flags.force
      if (!confirmed) {
        const { conf } = await inquirer.prompt<{ conf: boolean }>({
          name: 'conf',
          type: 'confirm',
          message: `Are you sure you want to delete the model named ${name}? This is NOT reversible.`,
          default: false,
        })
        confirmed = conf
      }

      if (confirmed) {
        await fs.unlink(models[name].path)
        delete models[name]
        config.set('models', models)
        this.spinner.succeed(`Model ${name} successfully deleted`)
      } else {
        this.spinner.info('Model deletion cancelled')
      }
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
