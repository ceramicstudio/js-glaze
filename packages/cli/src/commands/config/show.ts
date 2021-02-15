import Table from 'cli-table3'

import { Command } from '../../command'
import { USER_CONFIG } from '../../config'
import type { UserConfigKey as Key } from '../../config'

export default class ShowConfig extends Command {
  static description = 'show the full config'

  async run(): Promise<void> {
    const cfg = await this.getConfig()
    const config = cfg.get('user')

    const table = new Table({ head: ['Label', 'Key', 'Value'] })
    for (const [key, value] of Object.entries(config)) {
      table.push([USER_CONFIG[key as Key], key, value])
    }
    this.log(table.toString())
  }
}
