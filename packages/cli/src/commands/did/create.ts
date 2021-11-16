import { randomBytes } from 'crypto'

import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { toString } from 'uint8arrays'

import { Command } from '../../command'

type Flags = {
  ceramic?: string
}

export default class CreateDID extends Command<Flags> {
  static description = 'create a new DID'

  static flags = Command.flags

  async run(): Promise<void> {
    this.spinner.start('Creating DID...')
    try {
      const seed = new Uint8Array(randomBytes(32))
      const did = new DID({ provider: new Ed25519Provider(seed), resolver: this.resolverRegistry })
      await did.authenticate()
      this.spinner.succeed(
        `Created DID ${this.chalk.cyan(did.id)} with seed ${this.chalk.red(
          toString(seed, 'base16')
        )}`
      )
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
