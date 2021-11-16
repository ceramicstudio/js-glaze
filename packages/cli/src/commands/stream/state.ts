import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class State extends Command<
  CommandFlags,
  {
    streamId: string
  }
> {
  static description = 'Get the state of a stream'

  static args = [{ name: 'streamId', description: 'Stream ID', required: true }]

  async run(): Promise<void> {
    this.spinner.start(`Querying stream ${this.args.streamId}`)

    try {
      const stream = await this.ceramic.loadStream(this.args.streamId)
      this.spinner.succeed(`Queried stream ${this.args.streamId}`)
      this.logJSON(stream)
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
