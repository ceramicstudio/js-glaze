import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class MergeDID extends Command<
  CommandFlags,
  { model: string; alias: string; contents: Record<string, unknown> }
> {
  static description = 'merge the contents of a record in a DID DataStore'

  static flags = Command.flags

  static args = [
    { name: 'model', description: 'Model name or path to JSON file', required: true },
    { name: 'alias', description: 'Definition alias', required: true },
    {
      name: 'contents',
      description: 'String-encoded JSON data',
      required: true,
      parse: JSON.parse,
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Merging contents...')
    try {
      const model = await this.getDataModel(this.args.model)
      const store = this.getDataStore(model)
      await store.merge(this.args.alias, this.args.contents)
      this.spinner.succeed('Contents successfully merged')
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
