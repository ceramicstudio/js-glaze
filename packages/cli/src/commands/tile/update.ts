import { TileDocument, type TileMetadataArgs } from '@ceramicnetwork/stream-tile'
import { Flags } from '@oclif/core'

import { 
  Command, 
  STREAM_ID_ARG, 
  type CommandFlags,
} from '../../command.js'

type Flags = CommandFlags & {
  metadata?: TileMetadataArgs
  content?: Record<string, unknown>
}

export default class Update extends Command<Flags, { content: string; streamId: string }> {
  static description = 'Update a stream'

  static args = [
    STREAM_ID_ARG,
  ]
  
  static flags = {
    ...Command.flags,
    metadata: Flags.string({
      char: 'm',
      description: 'Optional metadata for the stream',
      parse: JSON.parse,
    }),
    content: Flags.string({
      description: 'new contents for the stream',
      parse: JSON.parse,
    }),
  }

  async run(): Promise<void> {
    this.spinner.start('Updating stream...')
    try {
      const doc = await TileDocument.load(this.ceramic, this.args.streamId)
      await doc.update(this.flags.content, this.flags.metadata)
      this.spinner.succeed('Updated stream')
      this.logJSON({
        streamID: this.args.streamId,
        content: doc.content,
      })
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
