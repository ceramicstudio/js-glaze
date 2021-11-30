import { flags } from '@oclif/command'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { TileMetadataArgs } from '@ceramicnetwork/stream-tile'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

type Flags = CommandFlags & {
  metadata?: TileMetadataArgs
}

export default class Update extends Command<Flags, { content: string; streamId: string }> {
  static description = 'Update a stream'

  static args = [
    {
      name: 'streamId',
      description: 'ID of the stream',
      required: true,
    },
    {
      name: 'content',
      description: 'new contents for the stream',
      required: true,
      parse: JSON.parse,
    },
  ]
  static flags = {
    ...Command.flags,
    metadata: flags.string({
      char: 'm',
      description: 'Optional metadata for the stream',
      parse: JSON.parse,
    }),
  }

  async run(): Promise<void> {
    this.spinner.start('Updating stream...')
    try {
      const doc = await TileDocument.load(this.ceramic, this.args.streamId)
      await doc.update(this.args.content, this.flags.metadata)
      this.spinner.succeed('Updated stream')
      this.logJSON({ commitID: doc.commitId.toString(), content: doc.content })
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
