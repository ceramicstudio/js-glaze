const path = require('path')
const Ceramic = require('@ceramicnetwork/core').default
const dagJose = require('dag-jose').default
const IPFS = require('ipfs-core')
const NodeEnvironment = require('jest-environment-node')
const { dir } = require('tmp-promise')
const { sha256 } = require('multiformats/hashes/sha2')
const { legacy } = require('multiformats/legacy')

const hasher = { [sha256.code]: sha256 }
const dagJoseFormat = legacy(dagJose, {hashes: hasher})

module.exports = class CeramicEnvironment extends NodeEnvironment {
  async setup() {
    this.tmpFolder = await dir({ unsafeCleanup: true })
    this.global.ipfs = await IPFS.create({
      ipld: { formats: [dagJoseFormat] },
      profiles: ['test'],
      repo: path.join(this.tmpFolder.path, 'ipfs'),
      silent: true,
    })
    this.global.ceramic = await Ceramic.create(this.global.ipfs, {
      anchorOnRequest: false,
      stateStoreDirectory: path.join(this.tmpFolder.path, 'ceramic'),
    })
  }

  async teardown() {
    await super.teardown()
    await this.global.ceramic.close()
    await this.global.ipfs.stop()
    await this.tmpFolder.cleanup()
  }
}
