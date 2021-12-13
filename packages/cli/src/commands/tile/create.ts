import { flags } from '@oclif/command'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { TileMetadataArgs } from '@ceramicnetwork/stream-tile'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

type Flags = CommandFlags & {
  'only-genesis'?: boolean
  metadata?: TileMetadataArgs
}

export default class CreateTile extends Command<Flags, { content: string }> {
  static description = 'create a new Tile stream'

  static args = [
    {
      name: 'content',
      description: 'stream contents (JSON encoded as string)',
      required: true,
      parse: JSON.parse,
    },
  ]

  static flags = {
    ...Command.flags,
    'only-genesis': flags.boolean({
      char: 'g',
      description: 'only generate genesis commit',
      default: false,
    }),
    metadata: flags.string({
      char: 'm',
      description: 'stream metadata',
      parse: JSON.parse,
    }),
  }

  async run(): Promise<void> {
    this.spinner.start('Creating stream...')
    try {
      const metadata = this.flags.metadata ?? {}
      metadata.controllers = [this.authenticatedDID.id]

      const tile = await TileDocument.create(this.ceramic, this.args.content, metadata, {
        anchor: !this.flags['only-genesis'],
        publish: !this.flags['only-genesis'],
      })

      this.spinner.succeed(`Created stream ${tile.id.toString()}.`)
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
