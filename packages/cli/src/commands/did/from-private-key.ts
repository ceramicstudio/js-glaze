import chalk from 'chalk'

import { Command, CommandFlags } from '../../command.js'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { fromString } from 'uint8arrays'

export default class DIDFromPrivateKey extends Command<CommandFlags, { didPrivateKey: string }> {
  static description = 'create a new DID from a specified private key'

  static args = [
    {
      name: 'didPrivateKey',
      required: false,
      description: 'a random 32-bit private key represented as a base16 string',
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Creating DID...')
    const possibleSeedInputs = [this.stdin, this.args.didPrivateKey, this.flags['did-private-key']]
    if (possibleSeedInputs.every((input) => input === undefined)) {
      this.spinner.fail(
        `You need to pass the private key parameter as a positional arg, as a flag value, via stdin or as the DID_PRIVATE_KEY environmental variable`
      )
      return
    } else if (possibleSeedInputs.filter((input) => input !== undefined).length > 1) {
      this.spinner.fail(
        `Don't pass the private key parameter in more than one way out of: arg, flag, stdin, DID_PRIVATE_KEY environmental variable`
      )
      return
    }
    try {
      const hexString = possibleSeedInputs.find((input) => input !== undefined) || ''
      const seed = fromString(hexString, 'base16')
      const did = new DID({ provider: new Ed25519Provider(seed), resolver: this.resolverRegistry })
      await did.authenticate()
      this.spinner.succeed(`Creating DID... Done!`)
      // Logging the DID to stdout, so that it can be piped using standard I/O or redirected to a file
      this.log(chalk.cyan(did.id))
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
