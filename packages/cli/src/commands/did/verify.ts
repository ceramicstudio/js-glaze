import type { DagJWS } from 'dids'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class VerifyDID extends Command<CommandFlags, { jws: string }> {
  static description = 'verify a JSON Web Signature'

  static flags = Command.flags

  static args = [{ name: 'jws', description: 'JSON Web Signature', required: true }]

  async run(): Promise<void> {
    this.spinner.start('Verifying JWS...')
    try {
      const did = await this.getDID()
      const jws = this.args.jws[0] === '{' ? (JSON.parse(this.args.jws) as DagJWS) : this.args.jws
      const verified = await did.verifyJWS(jws)
      this.spinner.succeed('Verified:')
      this.logJSON(verified)
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
