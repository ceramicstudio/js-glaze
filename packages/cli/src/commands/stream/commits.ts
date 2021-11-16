import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class Commits extends Command<
  CommandFlags,
  {
    streamId: string
  }
> {
  static description = 'List stream commits'
  static args = [{ name: 'streamId', description: 'streamID to be queried.' }]

  async run(): Promise<void> {
    this.spinner.start('Loading Stream...')
    try {
      const stream = await this.ceramic.loadStream(this.args.streamId)
      const commits = stream.allCommitIds.map((v) => v.toString())

      this.spinner.succeed('Stream commits loaded.')

      console.log(JSON.stringify(commits, null, 2))
    } catch (e) {
      this.spinner.fail((e as Error).message)
      throw e
    }
  }
}
