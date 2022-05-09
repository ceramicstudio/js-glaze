import { SyncOptions } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'

import { 
  Command, 
  type CommandFlags,
  STREAM_ID_ARG,
  SYNC_OPTION_FLAG
} from '../../command.js'

type Flags = CommandFlags & {
  syncOption?: SyncOptions
}

export default class ShowTile extends Command<Flags, { streamId: string }> {
  static description = 'show the contents of a Tile stream'

  static args = [
    STREAM_ID_ARG,
  ]

  static flags = {
    ...Command.flags,
    syncOption: SYNC_OPTION_FLAG,
  }

  async run(): Promise<void> {
    this.spinner.start(`Loading stream ${this.args.streamId}`)
    try {
      const stream = await TileDocument.load(
        this.ceramic, 
        this.args.streamId,
        { sync: this.flags.syncOption }
      )
      this.spinner.succeed(`Retrieved details of stream ${this.args.streamId}.`)
      this.logJSON(stream.content)
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
