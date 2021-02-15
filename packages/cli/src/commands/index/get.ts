import { Command } from '../../command'
import type { CommandFlags } from '../../command'

import { getPublicDID } from '../../config'

export default class GetIndex extends Command<CommandFlags, { did: string; key: string }> {
  static description = 'get the contents of a key in IDX'

  static flags = Command.flags

  static args = [
    { name: 'did', description: 'DID or label', required: true },
    { name: 'key', required: true },
  ]

  async run(): Promise<void> {
    this.spinner.start('Loading...')
    try {
      const did = await getPublicDID(this.args.did)
      if (did == null) {
        this.spinner.fail('No local DID found for given label')
        return
      }

      const idx = await this.getIDX()
      const value = await idx.get(this.args.key, did)
      if (value == null) {
        this.spinner.warn('No content')
      } else {
        this.spinner.succeed('Contents successfully loaded')
        this.logJSON(value)
      }
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
