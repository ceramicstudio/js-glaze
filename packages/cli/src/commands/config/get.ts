import { Command, type CommandFlags } from '../../command.js'
import { USER_CONFIG, type UserConfigKey as Key, config } from '../../config.js'

export default class GetConfig extends Command<CommandFlags, { key: Key }> {
  static description = 'get a config value'

  static args = [{ name: 'key', required: true, options: Object.keys(USER_CONFIG) }]

  run(): Promise<void> {
    this.log(config.get('user')[this.args.key])
    return Promise.resolve()
  }
}
