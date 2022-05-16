import { TileDocument } from '@ceramicnetwork/stream-tile'

import { 
  Command, 
  type QueryCommandFlags,
  STREAM_ID_ARG,
  SYNC_OPTION_FLAG
} from '../../command.js'

export default class ShowTile extends Command<QueryCommandFlags, { streamId: string }> {
  static description = 'show the contents of a Tile stream'

  static args = [
    STREAM_ID_ARG,
  ]

  static flags = {
    ...Command.flags,
    sync: SYNC_OPTION_FLAG,
  }

  async run(): Promise<void> {
    this.spinner.start(`Loading stream ${this.args.streamId}`)
    try {
      const stream = await TileDocument.load(
        this.ceramic, 
        this.args.streamId,
        { sync: this.flags.sync }
      )
      this.spinner.succeed(`Retrieved details of stream ${this.args.streamId}.`)
      this.logJSON(stream.content)
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
