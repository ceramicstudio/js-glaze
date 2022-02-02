import { CliUx } from '@oclif/core'

import { Command } from '../../command.js'
import { config } from '../../config.js'

export default class ListModels extends Command {
  static description = 'list local models'

  run(): Promise<void> {
    const tree = CliUx.ux.tree()

    this.log('local models')
    for (const name of Object.keys(config.get('models'))) {
      tree.insert(name)
    }
    tree.display()

    return Promise.resolve()
  }
}
