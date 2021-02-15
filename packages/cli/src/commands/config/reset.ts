import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { DEFAULT_CERAMIC_URL, USER_CONFIG } from '../../config'
import type { UserConfigKey as Key } from '../../config'

export default class ResetConfig extends Command<CommandFlags, { key: Key }> {
  static description = 'reset a config value'

  static args = [{ name: 'key', required: true, options: Object.keys(USER_CONFIG) }]

  async run(): Promise<void> {
    switch (this.args.key) {
      case 'ceramic-url': {
        const cfg = await this.getConfig()
        const config = cfg.get('user')
        config['ceramic-url'] = DEFAULT_CERAMIC_URL
        cfg.set('user', config)
        this.spinner.succeed(`${USER_CONFIG[this.args.key]} successfully reset`)
        return
      }
      default:
        this.spinner.fail('Unsupported key')
    }
  }
}
