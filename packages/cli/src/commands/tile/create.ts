import { flags } from '@oclif/command'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { TileMetadataArgs } from '@ceramicnetwork/stream-tile'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

type Flags = CommandFlags & {
  metadata?: TileMetadataArgs
  content?: string
}

export default class CreateTile extends Command<Flags, { content: string }> {
  static description = 'create a new Tile stream'

  static flags = {
    ...Command.flags,
    metadata: flags.string({
      char: 'm',
      description: 'stream metadata',
      parse: JSON.parse,
    }),
    content: flags.string({
      char: 'b',
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
