import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class InfoDefinition extends Command<CommandFlags, { id: string }> {
  static description = 'displays information about a definition'

  static flags = Command.flags

  static args = [
    { name: 'id', description: 'document ID or alias of the definition', required: true },
  ]

  async run(): Promise<void> {
    this.spinner.start('Loading...')
    try {
      const definition = await this.getDefinition(this.args.id)
      this.spinner.succeed('Definition loaded')
      this.logJSON(definition)
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
