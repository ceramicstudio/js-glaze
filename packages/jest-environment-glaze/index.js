import CeramicEnvironment from 'jest-environment-ceramic'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { DID } from 'dids'
import { getResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays/from-string'

export default class GlazeEnvironment extends CeramicEnvironment {
  constructor(config, context) {
    super(config, context)
    const seed = config.projectConfig?.seed
    this.seed = seed ? fromString(seed) : new Uint8Array(32)
  }

  async setup() {
    await super.setup()
    const did = new DID({
      resolver: getResolver(),
      provider: new Ed25519Provider(this.seed),
    })
    await did.authenticate()
    this.global.ceramic.did = did
  }
}
