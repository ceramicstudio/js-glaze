import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { TileDocument } from '@ceramicnetwork/stream-tile'

export default class Watch extends Command<
  CommandFlags,
  {
    streamId: string
  }
> {
  static description = 'Watch for updates in a stream'
  static args = [{ name: 'streamId', required: true, description: 'Stream ID' }]

  async run(): Promise<void> {
    this.spinner.start('Finding Stream...')
    try {
      const doc = await TileDocument.load(this.ceramic, this.args.streamId)
      doc.subscribe(() => {
        console.log('--- Document updated ---')
        this.logJSON(doc.content)
      })
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
