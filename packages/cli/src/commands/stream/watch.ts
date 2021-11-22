import chalk from 'chalk'
import { TileDocument } from '@ceramicnetwork/stream-tile'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class Watch extends Command<
  CommandFlags,
  {
    streamId: string
  }
> {
  static description = 'Monitor stream for any updates.'
  static args = [{ name: 'streamId', required: true, description: 'Stream ID' }]

  async run(): Promise<void> {
    this.spinner.start('Finding Stream...')
    try {
      const doc = await TileDocument.load(this.ceramic, this.args.streamId)
      doc.subscribe(() => {
        console.log(chalk.green('--- Document updated ---'))
        this.logJSON(doc.content)
      })
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
