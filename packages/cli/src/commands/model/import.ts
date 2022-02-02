import { ModelManager } from '@glazed/devtools'
import type { EncodedManagedModel } from '@glazed/types'

import { Command, type CommandFlags } from '../../command.js'
import { config } from '../../config.js'
import { loadManagedModel } from '../../model.js'
import { read, write } from '../../fs.js'

type Args = {
  localName: string
  importName: string
}

export default class ImportModel extends Command<CommandFlags, Args> {
  static description = 'import a model into another one'

  static flags = Command.flags

  static args = [
    { name: 'localName', required: true },
    { name: 'importName', required: true },
  ]

  async run(): Promise<void> {
    this.spinner.start('Importing model...')
    try {
      const { localName, importName } = this.args
      const models = config.get('models')
      if (models[localName] == null) {
        throw new Error(`Model ${localName} does not exist`)
      }

      const model = await read<EncodedManagedModel>(models[localName].path)
      const manager = ModelManager.fromJSON(this.ceramic, model)

      const toImport = await loadManagedModel(importName)
      manager.addJSONModel(toImport)

      await write(models[localName].path, manager.toJSON())
      this.spinner.succeed('Model successfully updated')
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
