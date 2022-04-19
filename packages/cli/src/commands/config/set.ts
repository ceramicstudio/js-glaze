import chalk from 'chalk'

import { Command, type CommandFlags } from '../../command.js'
import { USER_CONFIG, type UserConfig, type UserConfigKey as Key, config } from '../../config.js'

type Args = { key: Key; value: UserConfig[Key] }

export default class SetConfig extends Command<CommandFlags, Args> {
  static description = 'set a config value'

  static args = [
    { name: 'key', required: true, options: Object.keys(USER_CONFIG) },
    { name: 'value', required: true },
  ]

  run(): Promise<void> {
    const cfg = config.get('user')
    cfg[this.args.key] = this.args.value
    config.set('user', cfg)
    this.spinner.succeed(`${chalk.green(USER_CONFIG[this.args.key])} successfully set`)
    return Promise.resolve()
  }
}
