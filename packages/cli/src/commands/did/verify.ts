import type { DagJWS } from 'dids'

import { Command, type CommandFlags } from '../../command.js'

export default class VerifyDID extends Command<CommandFlags, { jws: string }> {
  static description = 'verify a JSON Web Signature'

  static flags = Command.flags

  static args = [{ name: 'jws', description: 'JSON Web Signature', required: true }]

  async run(): Promise<void> {
    this.spinner.start('Verifying JWS...')
    try {
      const did = this.getDID()
      const jws = this.args.jws.startsWith('{')
        ? (JSON.parse(this.args.jws) as DagJWS)
        : this.args.jws
      const verified = await did.verifyJWS(jws)
      this.spinner.succeed('Verified:')
      this.logJSON(verified)
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
