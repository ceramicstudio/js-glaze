import { cli } from 'cli-ux'

import { Command } from '../../command'
import { config } from '../../config'

export default class ListModels extends Command {
  static description = 'list local models'

  run(): Promise<void> {
    const tree = cli.tree()

    this.log('local models')
    for (const name of Object.keys(config.get('models'))) {
      tree.insert(name)
    }
    tree.display()

    return Promise.resolve()
  }
}
