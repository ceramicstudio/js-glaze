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

export default class Commits extends Command<Flags, { streamId: string }> {
  static description = 'list commits contained within a stream'

  static args = [
    STREAM_ID_ARG,
  ]

  static flags = {
    ...Command.flags,
    sync: SYNC_OPTION_FLAG,
  }

  async run(): Promise<void> {
    this.spinner.start(`Loading stream ${this.args.streamId}...`)
    try {
      const stream = await this.ceramic.loadStream(
        this.args.streamId,
        { sync: this.flags.sync }
      )
      const commits = stream.allCommitIds.map((v) => v.toString())
      this.spinner.succeed(`Stream commits loaded.`)
      this.logJSON(commits)
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
