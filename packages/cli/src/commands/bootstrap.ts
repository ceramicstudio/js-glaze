import { publishIDXConfig } from '@ceramicstudio/idx-tools'

import { Command } from '../command'
import type { CommandFlags } from '../command'

export default class Bootstrap extends Command<CommandFlags> {
  static description = 'bootstrap IDX on a Ceramic node'

  static flags = Command.flags

  async run(): Promise<void> {
    this.spinner.start('Publishing IDX contents...')
    try {
      const ceramic = await this.getCeramic()
      await publishIDXConfig(ceramic)
      this.spinner.succeed('IDX successfully bootstrapped')
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
