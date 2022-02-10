import { TileDocument, type TileMetadataArgs } from '@ceramicnetwork/stream-tile'

import { Command, type CommandFlags } from '../../command.js'

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
      this.spinner.succeed(`Loaded tile ${tile.id.toString()}.`)
      this.logJSON({
        streamID: tile.id.toString(),
        content: tile.content,
      })
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
