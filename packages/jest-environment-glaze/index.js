const CeramicEnvironment = require('jest-environment-ceramic')
const { Ed25519Provider } = require('key-did-provider-ed25519')
const { DID } = require('dids')
const KeyResolver = require('key-did-resolver').default
const fromString = require('uint8arrays/from-string')

module.exports = class GlazeEnvironment extends CeramicEnvironment {
  constructor(config, context) {
    super(config, context)
    this.seed = config.seed ? fromString(config.seed) : new Uint8Array(32)
  }

  async setup() {
    await super.setup()
    const did = new DID({
      resolver: KeyResolver.getResolver(),
      provider: new Ed25519Provider(this.seed),
    })
    await did.authenticate()
    this.global.ceramic.did = did
  }
}
