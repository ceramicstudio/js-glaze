import chalk from 'chalk'

import { Command, type CommandFlags } from '../../command.js'
import {
  DEFAULT_CERAMIC_URL,
  USER_CONFIG,
  type UserConfigKey as Key,
  config,
} from '../../config.js'

export default class ResetConfig extends Command<CommandFlags, { key: Key }> {
  static description = 'reset a config value'

  static args = [{ name: 'key', required: true, options: Object.keys(USER_CONFIG) }]

  run(): Promise<void> {
    switch (this.args.key) {
      case 'ceramic-url': {
        const cfg = config.get('user')
        cfg['ceramic-url'] = DEFAULT_CERAMIC_URL
        config.set('user', cfg)
        this.spinner.succeed(`${chalk.green(USER_CONFIG[this.args.key])} successfully reset`)
        break
      }
      default:
        this.spinner.fail('Unsupported key')
    }
    return Promise.resolve()
  }
}
