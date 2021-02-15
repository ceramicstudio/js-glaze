import { randomBytes } from 'crypto'

import { flags } from '@oclif/command'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { fromString, toString } from 'uint8arrays'

import { Command } from '../../command'
import { getPublicDID } from '../../config'

type Flags = {
  ceramic?: string
  label?: string
  seed?: string
}

export default class CreateDID extends Command<Flags> {
  static description = 'create a new DID'

  static flags = {
    ...Command.flags,
    label: flags.string({ char: 'l', description: 'label for the DID' }),
    seed: flags.string({
      char: 's',
      description: 'base16-encoded seed to use for the DID',
    }),
  }

  async run(): Promise<void> {
    this.spinner.start('Creating DID...')
    try {
      if (this.flags.label) {
        const exists = await getPublicDID(this.flags.label)
        if (exists != null) {
          this.spinner.fail('This label is already used')
          return
        }
      }

      const [cfg, resolver] = await Promise.all([this.getConfig(), this.getResolverRegistry()])
      const seed = this.flags.seed
        ? fromString(this.flags.seed, 'base16')
        : new Uint8Array(randomBytes(32))

      const did = new DID({ provider: new Ed25519Provider(seed), resolver })
      await did.authenticate()

      const dids = cfg.get('dids')
      dids[did.id] = {
        createdAt: new Date().toISOString(),
        label: this.flags.label,
        seed: toString(seed, 'base16'),
      }
      cfg.set('dids', dids)

      this.spinner.succeed(`Created DID: ${did.id}`)
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
