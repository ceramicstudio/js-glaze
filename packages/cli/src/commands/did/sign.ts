import { Command, type CommandFlags } from '../../command.js'

export default class SignDID extends Command<CommandFlags, { did: string; contents: unknown }> {
  static description = 'create a JSON Web Signature'

  static flags = Command.flags

  static args = [
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
      const jws = await this.authenticatedDID.createJWS(this.args.contents)
      this.spinner.succeed('JWS:')
      this.logJSON(jws)
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
