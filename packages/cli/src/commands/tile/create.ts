import { TileDocument, type TileMetadataArgs } from '@ceramicnetwork/stream-tile'
import { Flags } from '@oclif/core'

import { Command, type CommandFlags } from '../../command.js'

type Flags = CommandFlags & {
  metadata?: TileMetadataArgs
  content?: string
}

export default class CreateTile extends Command<Flags, { content: string }> {
  static description = 'create a new Tile stream'

  static flags = {
    ...Command.flags,
    metadata: Flags.string({
      char: 'm',
      description: 'stream metadata',
      parse: JSON.parse,
    }),
    content: Flags.string({
      description: 'stream contents (JSON encoded as string)',
      parse: JSON.parse,
    }),
  }

  async run(): Promise<void> {
    this.spinner.start('Creating stream...')
    try {
      const metadata = this.flags.metadata ?? {}
      metadata.controllers = [this.authenticatedDID.id]

      const tile = await TileDocument.create(this.ceramic, this.flags.content, metadata)

      this.spinner.succeed(`Created stream ${tile.id.toString()}.`)
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
