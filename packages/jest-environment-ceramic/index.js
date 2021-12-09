import path from 'path'
import { Ceramic } from '@ceramicnetwork/core'
import * as dagJose from 'dag-jose'
import { create } from 'ipfs-core'
import NodeEnvironment from 'jest-environment-node'
import { dir } from 'tmp-promise'

export default class CeramicEnvironment extends NodeEnvironment {
  async setup() {
    this.tmpFolder = await dir({ unsafeCleanup: true })
    this.global.ipfs = await create({
      ipld: { codecs: [dagJose] },
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
