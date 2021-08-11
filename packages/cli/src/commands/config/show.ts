import Table from 'cli-table3'

import { Command } from '../../command'
import { USER_CONFIG, config } from '../../config'
import type { UserConfigKey as Key } from '../../config'

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
