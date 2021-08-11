import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { USER_CONFIG, config } from '../../config'
import type { UserConfigKey as Key } from '../../config'

export default class GetConfig extends Command<CommandFlags, { key: Key }> {
  static description = 'get a config value'

  static args = [{ name: 'key', required: true, options: Object.keys(USER_CONFIG) }]

  run(): Promise<void> {
    this.log(config.get('user')[this.args.key])
    return Promise.resolve()
  }
}
