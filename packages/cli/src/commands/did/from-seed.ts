import chalk from 'chalk'
import { Flags } from '@oclif/core'

import { Command, CommandFlags } from '../../command.js'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { fromString } from 'uint8arrays'

type Flags = CommandFlags & {
  didKeySeed?: string
}

export default class DIDFromSeed extends Command<Flags, { didKeySeed: string }> {
  static description = 'create a new DID from a specified seed'

  static args = [
    {
      name: 'didKeySeed',
      required: false,
      description: 'a random 32-bit seed represented as a base16 string',
    },
  ]

  static flags = {
    ...Command.flags,
    'did-key-seed': Flags.string({
      description: 'a random 32-bit seed represented as a base16 string',
      required: false,
    }),
  }

  async run(): Promise<void> {
    this.spinner.start('Creating DID...')
    if (this.args.didKeySeed === undefined && this.flags['did-key-seed'] === undefined) {
      this.spinner.fail(
        `You need to pass the seed parameter either as a positional arg or as a flag value`
      )
      return
    } else if (this.args.didKeySeed !== undefined && this.flags['did-key-seed'] !== undefined) {
      this.spinner.fail(
        `Don't pass the seed parameter as both a positional arg and as a flag value`
      )
      return
    }
    try {
      const hexString = this.args.didKeySeed || (this.flags['did-key-seed'] as string) || ''
      const seed = fromString(hexString, 'base16')
      const did = new DID({ provider: new Ed25519Provider(seed), resolver: this.resolverRegistry })
      await did.authenticate()
      this.spinner.succeed(`Created DID ${chalk.cyan(did.id)}`)
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
