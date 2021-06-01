import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class CheckDefinition extends Command<CommandFlags, { id: string }> {
  static description = 'check if a stream is a valid definition'

  static flags = Command.flags

  static args = [{ name: 'id', description: 'stream ID to check', required: true }]

  async run(): Promise<void> {
    this.spinner.start('Loading...')
    try {
      await this.getDefinition(this.args.id)
      this.spinner.succeed('The loaded definition is valid')
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
