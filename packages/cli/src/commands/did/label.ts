import { flags } from '@oclif/command'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

interface Flags extends CommandFlags {
  delete: boolean
}

export default class LabelDID extends Command<Flags, { did: string; label?: string }> {
  static description = 'manage the label for a DID'

  static flags = {
    ...Command.flags,
    delete: flags.boolean({ char: 'd', description: 'delete the label' }),
  }

  static args = [{ name: 'did', required: true }, { name: 'label' }]

  async run(): Promise<void> {
    const cfg = await this.getConfig()
    const dids = cfg.get('dids')
    const did = dids[this.args.did]
    if (did == null) {
      this.spinner.fail('This DID is not stored locally')
      return
    }

    if (this.args.label) {
      // Ensure the label is not already assigned
      for (const [key, value] of Object.entries(dids)) {
        if (value.label === this.args.label) {
          if (key === this.args.did) {
            this.spinner.info('This label is already assigned to this DID')
          } else {
            this.spinner.fail('This label is already assigned to another DID')
          }
          return
        }
      }

      did.label = this.args.label
      cfg.set('dids', { ...dids, [this.args.did]: did })
      this.spinner.succeed('The label has successfully been applied')
    } else if (this.flags.delete) {
      // Remove label
      if (did.label == null) {
        this.spinner.info('The DID has no label assigned')
      } else {
        did.label = undefined
        cfg.set('dids', { ...dids, [this.args.did]: did })
        this.spinner.succeed('The label has successfully been removed')
      }
    } else if (did.label == null) {
      this.spinner.warn('The DID has no label assigned')
    } else {
      this.spinner.info(`Label: ${did.label}`)
    }
  }
}
