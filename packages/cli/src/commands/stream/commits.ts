import { Command, type CommandFlags } from '../../command.js'

export default class Commits extends Command<CommandFlags, { streamId: string }> {
  static description = 'list commits contained within a stream'

  static args = [
    {
      name: 'streamId',
      description: 'ID of the stream',
      required: true,
    },
  ]

  async run(): Promise<void> {
    this.spinner.start(`Loading stream ${this.args.streamId}...`)
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
