import path from 'path'
import { Ceramic } from '@ceramicnetwork/core'
import { create } from 'ipfs-core'
import NodeEnv from 'jest-environment-node'
import { dir } from 'tmp-promise'

const NodeEnvironment = NodeEnv.default ?? NodeEnv
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
        Pubsub: {
          // default "gossipsub" uses CJS and fails to import
          PubSubRouter: 'floodsub',
        },
      },
      repo: path.join(this.tmpFolder.path, 'ipfs'),
      silent: true,
    })
    const stateStoreDirectory = path.join(this.tmpFolder.path, 'ceramic')
    this.global.ceramic = await Ceramic.create(this.global.ipfs, {
      stateStoreDirectory: stateStoreDirectory,
      indexing: {
        db: `sqlite://${stateStoreDirectory}/ceramic.sqlite`,
        models: []
      }
    })
  }

  async teardown() {
    await this.global.ceramic.close()
    await this.global.ipfs.stop()
    await this.tmpFolder.cleanup()
    await super.teardown()
  }
}
