import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class Commits extends Command<
  CommandFlags,
  {
    streamId: string
  }
> {
  static description = 'List commits contained within a Stream.'
  static args = [
    {
      name: 'streamId',
      description: 'StreamID to be queried.',
      required: true,
    },
  ]

  async run(): Promise<void> {
    this.spinner.start(`Loading Stream ${this.args.streamId}...`)
    try {
      const stream = await this.ceramic.loadStream(this.args.streamId)
      const commits = stream.allCommitIds.map((v) => v.toString())

      this.spinner.succeed('Stream commits loaded.')

      this.logJSON(commits)
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
