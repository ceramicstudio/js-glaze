import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { USER_CONFIG } from '../../config'
import type { UserConfig, UserConfigKey as Key } from '../../config'

type Args = { key: Key; value: UserConfig[Key] }

export default class SetConfig extends Command<CommandFlags, Args> {
  static description = 'set a config value'

  static args = [
    { name: 'key', required: true, options: Object.keys(USER_CONFIG) },
    { name: 'value', required: true },
  ]

  async run(): Promise<void> {
    const cfg = await this.getConfig()
    const config = cfg.get('user')
    config[this.args.key] = this.args.value
    cfg.set('user', config)
    this.spinner.succeed(`${USER_CONFIG[this.args.key]} successfully set`)
  }
}
