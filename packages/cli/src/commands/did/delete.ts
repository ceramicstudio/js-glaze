import { flags } from '@oclif/command'
import inquirer from 'inquirer'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

interface Flags extends CommandFlags {
  force?: boolean
}

export default class DeleteDID extends Command<Flags, { did: string }> {
  static description = 'delete a local DID'

  static flags = {
    ...Command.flags,
    force: flags.boolean({ char: 'f', description: 'bypass confirmation prompt' }),
  }

  static args = [{ name: 'did', required: true }]

  async run(): Promise<void> {
    try {
      const cfg = await this.getConfig()
      const dids = cfg.get('dids')
      if (dids[this.args.did] == null) {
        this.spinner.warn(`DID ${this.args.did} does not exist`)
        return
      }

      let confirmed = !!this.flags.force
      if (!confirmed) {
        const { conf } = await inquirer.prompt<{ conf: boolean }>({
          name: 'conf',
          type: 'confirm',
          message: `Are you sure you want to delete the DID ${this.args.did}? This is NOT reversible.`,
          default: false,
        })
        confirmed = conf
      }

      if (confirmed) {
        delete dids[this.args.did]
        cfg.set('dids', dids)
        this.spinner.succeed('DID successfully deleted')
      } else {
        this.spinner.info('DID deletion cancelled')
      }
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
