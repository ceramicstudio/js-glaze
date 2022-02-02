import path from 'path'
import { Ceramic } from '@ceramicnetwork/core'
import { create } from 'ipfs-core'
import NodeEnvironment from 'jest-environment-node'
import { dir } from 'tmp-promise'

export default class CeramicEnvironment extends NodeEnvironment {
  async setup() {
    this.tmpFolder = await dir({ unsafeCleanup: true })
    this.global.ipfs = await create({
      // Note: the "test" profile doesn't seem to do much to disable networking,
      // so we need to set the relevant config explicitly to run tests in parallel
      config: {
        Addresses: {
          Swarm: [],
        },
        Bootstrap: [],
        Discovery: {
          MDNS: { Enabled: false },
          webRTCStar: { Enabled: false },
        },
      },
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
