import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class SetTile extends Command<
  CommandFlags,
  { did: string; id: string; contents: unknown }
> {
  static description = 'set the contents of a tile document'

  static flags = Command.flags

  static args = [
    { name: 'did', description: 'DID or label', required: true },
    { name: 'id', description: 'Document ID', required: true },
    {
      name: 'contents',
      description: 'String-encoded JSON data',
      required: true,
      parse: JSON.parse,
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Loading document...')
    try {
      const ceramic = await this.getAuthenticatedCeramic(this.args.did)
      const doc = await ceramic.loadDocument(this.args.id)
      this.spinner.succeed('Document loaded').start('Updating document...')
      await doc.change({ content: this.args.contents })
      this.spinner.succeed('Document successfully updated')
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
