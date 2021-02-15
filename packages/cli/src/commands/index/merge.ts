import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class MergeIndex extends Command<
  CommandFlags,
  { did: string; key: string; contents: Record<string, unknown> }
> {
  static description = 'merge the contents of a key in IDX'

  static flags = Command.flags

  static args = [
    { name: 'did', description: 'DID or label', required: true },
    { name: 'key', required: true },
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
      const idx = await this.getIDX(this.args.did)
      await idx.merge(this.args.key, this.args.contents)
      this.spinner.succeed('Contents successfully merged')
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
