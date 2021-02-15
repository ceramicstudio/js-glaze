import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class SchemaDefinition extends Command<CommandFlags, { id: string }> {
  static description = 'displays the schema for a definition contents'

  static flags = Command.flags

  static args = [
    { name: 'id', description: 'document ID or alias of the definition', required: true },
  ]

  async run(): Promise<void> {
    this.spinner.start('Loading...')
    try {
      const idx = await this.getIDX()
      const definition = await this.getDefinition(this.args.id)
      const doc = await idx._loadDocument(definition.schema)
      this.spinner.succeed('Schema loaded')
      this.logJSON(doc.content)
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
