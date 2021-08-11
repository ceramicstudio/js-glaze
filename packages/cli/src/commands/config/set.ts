import chalk from 'chalk'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { USER_CONFIG, config } from '../../config'
import type { UserConfig, UserConfigKey as Key } from '../../config'

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
