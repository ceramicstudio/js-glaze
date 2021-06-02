import { flags } from '@oclif/command'
import type { TileDocument } from '@ceramicnetwork/stream-tile'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

interface Flags extends CommandFlags {
  did?: string
}

export default class GetTile extends Command<Flags, { id: string }> {
  static description = 'get the contents of a tile stream'

  static flags = {
    ...Command.flags,
    did: flags.string({ description: 'DID or label' }),
  }

  static args = [{ name: 'id', description: 'Stream ID', required: true }]

  async run(): Promise<void> {
    this.spinner.start('Loading stream...')
    try {
      const ceramic = this.flags.did
        ? await this.getAuthenticatedCeramic(this.flags.did)
        : await this.getCeramic()
      const doc = await ceramic.loadStream<TileDocument>(this.args.id)
      this.spinner.succeed('Stream successfully loaded')
      this.logJSON(doc.content)
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
