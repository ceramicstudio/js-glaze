import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { TileMetadataArgs } from '@ceramicnetwork/stream-tile'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class DeterministicTile extends Command<
  CommandFlags,
  { metadata: TileMetadataArgs }
> {
  static description = 'load a deterministic Tile stream'

  static args = [
    {
      name: 'metadata',
      description: 'stream metadata',
      parse: JSON.parse,
      required: true,
    },
  ]

  static flags = {
    ...Command.flags,
  }

  async run(): Promise<void> {
    this.spinner.start('Loading stream...')

    try {
      const tile = await TileDocument.deterministic(this.ceramic, this.args.metadata)
      this.spinner.succeed(`Loaded stream ${tile.id.toString()}.`)
      this.logJSON({
        streamID: tile.id.toString(),
        commitID: tile.commitId.toString(),
        content: tile.content,
      })
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
