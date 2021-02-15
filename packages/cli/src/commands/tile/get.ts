import { flags } from '@oclif/command'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

interface Flags extends CommandFlags {
  did?: string
}

export default class GetTile extends Command<Flags, { id: string }> {
  static description = 'get the contents of a tile document'

  static flags = {
    ...Command.flags,
    did: flags.string({ description: 'DID or label' }),
  }

  static args = [{ name: 'id', description: 'Document ID', required: true }]

  async run(): Promise<void> {
    this.spinner.start('Loading document...')
    try {
      const ceramic = this.flags.did
        ? await this.getAuthenticatedCeramic(this.flags.did)
        : await this.getCeramic()
      const doc = await ceramic.loadDocument(this.args.id)
      this.spinner.succeed('Document successfully loaded')
      this.logJSON(doc.content)
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
