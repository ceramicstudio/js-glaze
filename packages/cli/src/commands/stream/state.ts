import { Command, STREAM_ID_ARG, SYNC_OPTION_FLAG, type QueryCommandFlags } from '../../command.js'

export default class State extends Command<QueryCommandFlags, { streamId: string }> {
  static description = 'get the state of a Stream'

  static args = [STREAM_ID_ARG]

  static flags = {
    ...Command.flags,
    sync: SYNC_OPTION_FLAG,
  }

  async run(): Promise<void> {
    this.spinner.start(`Querying stream ${this.args.streamId}`)

    try {
      const stream = await this.ceramic.loadStream(this.args.streamId, { sync: this.flags.sync })
      this.spinner.succeed(`Successfully queried stream ${this.args.streamId}.`)
      this.logJSON(stream.state)
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
