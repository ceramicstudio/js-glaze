import chalk from 'chalk'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { MODEL_NAME_PATTERN, config, getLocalModelPath } from '../../config'
import { write } from '../../fs'
import { EMPTY_MODEL } from '../../model'

const NAME_REGEXP = new RegExp(MODEL_NAME_PATTERN)

export default class CreateModel extends Command<CommandFlags, { name: string }> {
  static description = 'create a local model'

  static args = [{ name: 'name', required: true }]

  async run(): Promise<void> {
    this.spinner.start('Creating model...')
    try {
      const { name } = this.args
      const models = config.get('models')
      if (models[name] != null) {
        throw new Error(`A model named ${name} already exists`)
      }

      if (!NAME_REGEXP.test(name)) {
        throw new Error('Name can only contain alphanumeric characters, "_" and "-".')
      }

      const path = getLocalModelPath(name)
      await write(path, EMPTY_MODEL)
      models[name] = { source: 'local', path }
      config.set('models', models)

      this.spinner.succeed(`Model ${chalk.green(name)} successfully created`)
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
