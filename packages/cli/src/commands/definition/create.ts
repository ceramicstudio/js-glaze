import { createDefinition } from '@ceramicstudio/idx-tools'
import { flags } from '@oclif/command'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

interface Flags extends CommandFlags {
  name: string
  description: string
  schema: string
  url?: string
}

export default class CreateDefinition extends Command<Flags, { did: string }> {
  static description = 'create a definition'

  static flags = {
    ...Command.flags,
    name: flags.string({
      char: 'n',
      description: 'name of the definition',
      required: true,
    }),
    description: flags.string({
      char: 'd',
      description: 'description of the definition',
      required: true,
    }),
    schema: flags.string({
      char: 's',
      description: 'schema for the definition contents',
      required: true,
    }),
    url: flags.string({ char: 'u', description: 'documentation URL for the definition' }),
  }

  static args = [{ name: 'did', description: 'DID to create the definition with', required: true }]

  async run(): Promise<void> {
    this.spinner.start('Creating definition...')
    try {
      const ceramic = await this.getAuthenticatedCeramic(this.args.did)
      const doc = await createDefinition(ceramic, {
        name: this.flags.name,
        schema: this.flags.schema,
        description: this.flags.description,
        url: this.flags.url,
      })
      this.spinner.succeed(`Definition successfully created: ${doc.id.toString()}`)
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
