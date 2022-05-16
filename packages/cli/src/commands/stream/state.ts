import { SyncOptions } from '@ceramicnetwork/common'
import { 
  Command,
  STREAM_ID_ARG,
  SYNC_OPTION_FLAG,
  type CommandFlags
} from '../../command.js'

type Flags = CommandFlags & {
  sync?: SyncOptions
}

export default class State extends Command<Flags, { streamId: string }> {
  static description = 'get the state of a Stream'

  static args = [
    STREAM_ID_ARG,
  ]

  static flags = {
    ...Command.flags,
    sync: SYNC_OPTION_FLAG,
  }

  async run(): Promise<void> {
    this.spinner.start(`Querying stream ${this.args.streamId}`)

    try {
      const stream = await this.ceramic.loadStream(
        this.args.streamId,
        { sync: this.flags.sync }
      )
      this.spinner.succeed(`Successfully queried stream ${this.args.streamId}.`)
      this.logJSON(stream.state)
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
