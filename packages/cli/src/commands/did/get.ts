import { flags } from '@oclif/command'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

type Flags = CommandFlags & {
  did?: string
}

export default class GetDID extends Command<Flags, { model: string; alias: string }> {
  static description = 'get the contents of a record in a DID DataStore'

  static flags = {
    ...Command.flags,
    did: flags.string({ description: 'DID', exclusive: ['key'] }),
  }

  static args = [
    { name: 'model', description: 'Model name or path to JSON file', required: true },
    { name: 'alias', description: 'Definition alias', required: true },
  ]

  async run(): Promise<void> {
    this.spinner.start('Loading...')
    try {
      let did: string
      if (this.flags.key != null) {
        did = this.authenticatedDID.id
      } else if (this.flags.did != null) {
        did = this.flags.did
      } else {
        throw new Error('Missing DID')
      }

      const model = await this.getDataModel(this.args.model)
      const store = this.getDataStore(model)

      // eslint-disable-next-line
      const value = await store.get(this.args.alias, did)
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
