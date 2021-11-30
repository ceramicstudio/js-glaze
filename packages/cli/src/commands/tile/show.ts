import { TileDocument } from '@ceramicnetwork/stream-tile'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class ShowTile extends Command<CommandFlags, { streamId: string }> {
  static description = 'show the contents of a Tile stream'

  static args = [
    {
      name: 'streamId',
      required: true,
      description: 'ID of the stream',
    },
  ]

  async run(): Promise<void> {
    this.spinner.start(`Loading stream ${this.args.streamId}`)
    try {
      const stream = await TileDocument.load(this.ceramic, this.args.streamId)
      this.spinner.succeed(`Retrieved details of stream ${this.args.streamId}`)
      this.logJSON(stream.content)
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
