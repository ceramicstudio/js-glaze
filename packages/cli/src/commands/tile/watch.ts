import chalk from 'chalk'
import { TileDocument } from '@ceramicnetwork/stream-tile'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class Watch extends Command<CommandFlags, { streamId: string }> {
  static description = 'monitor stream for any updates'

  static args = [
    {
      name: 'streamId',
      required: true,
      description: 'ID of the stream',
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Loading stream...')
    try {
      const doc = await TileDocument.load(this.ceramic, this.args.streamId)
      doc.subscribe(() => {
        this.log(chalk.green('--- Document updated ---'))
        this.logJSON(doc.content)
      })
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
