import chalk from 'chalk'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { DEFAULT_CERAMIC_URL, USER_CONFIG, config } from '../../config'
import type { UserConfigKey as Key } from '../../config'

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
