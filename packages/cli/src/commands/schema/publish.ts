import { publishSchema } from '@ceramicstudio/idx-tools'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class PublishSchema extends Command<
  CommandFlags,
  { did: string; schema: Record<string, any> }
> {
  static description = 'publish a schema'

  static args = [
    { name: 'did', description: 'DID or label', required: true },
    {
      name: 'schema',
      description: 'String-encoded JSON schema',
      required: true,
      parse: JSON.parse,
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Publishing schema...')
    try {
      const ceramic = await this.getAuthenticatedCeramic(this.args.did)
      const schema = await publishSchema(ceramic, { name: 'input', content: this.args.schema })
      this.spinner.succeed(`Schema published with URL: ${schema.commitId.toUrl()}`)
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
