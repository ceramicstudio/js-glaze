import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class SignDID extends Command<CommandFlags, { did: string; contents: unknown }> {
  static description = 'create a JSON Web Signature'

  static flags = Command.flags

  static args = [
    { name: 'did', description: 'DID or label', required: true },
    {
      name: 'contents',
      description: 'String-encoded JSON data',
      required: true,
      parse: JSON.parse,
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Creating JWS...')
    try {
      const did = await this.getDID(this.args.did)
      const jws = await did.createJWS(this.args.contents)
      this.spinner.succeed('JWS:')
      this.logJSON(jws)
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
