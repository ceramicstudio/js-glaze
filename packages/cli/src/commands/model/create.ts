import chalk from 'chalk'

import { Command, type CommandFlags } from '../../command.js'
import { MODEL_NAME_PATTERN, config, getLocalModelPath } from '../../config.js'
import { write } from '../../fs.js'
import { EMPTY_MODEL } from '../../model.js'

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
