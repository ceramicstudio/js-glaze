import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class State extends Command<
  CommandFlags,
  {
    streamId: string
  }
> {
  static description = 'Get the state of a Stream'

  static args = [
    {
      name: 'streamId',
      required: true,
      description: 'Document StreamID',
    },
  ]

  async run(): Promise<void> {
    this.spinner.start(`Querying stream ${this.args.streamId}`)

    try {
      const stream = await this.ceramic.loadStream(this.args.streamId)
      this.spinner.succeed(`Successfully queried stream ${this.args.streamId}`)
      this.logJSON(stream)
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
