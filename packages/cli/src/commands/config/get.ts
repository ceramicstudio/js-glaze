import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { USER_CONFIG } from '../../config'
import type { UserConfigKey as Key } from '../../config'

export default class GetConfig extends Command<CommandFlags, { key: Key }> {
  static description = 'get a config value'

  static args = [{ name: 'key', required: true, options: Object.keys(USER_CONFIG) }]

  async run(): Promise<void> {
    const cfg = await this.getConfig()
    this.log(cfg.get('user')[this.args.key])
  }
}
