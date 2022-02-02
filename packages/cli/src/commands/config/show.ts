import Table from 'cli-table3'

import { Command } from '../../command.js'
import { USER_CONFIG, type UserConfigKey as Key, config } from '../../config.js'

export default class ShowConfig extends Command {
  static description = 'show the full config'

  run(): Promise<void> {
    const table = new Table({ head: ['Label', 'Key', 'Value'] })
    for (const [key, value] of Object.entries(config.get('user'))) {
      table.push([USER_CONFIG[key as Key], key, value])
    }
    this.log(table.toString())
    return Promise.resolve()
  }
}
