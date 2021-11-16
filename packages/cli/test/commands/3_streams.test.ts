import { expect, test } from '@oclif/test'

import Commits from '../../src/commands/stream/commits'
import State from '../../src/commands/stream/state'

import { makeDID, createTile, globalKey } from '../test'
describe('streams', async () => {
  beforeEach(async () => {
    if (!globalKey) {
      await makeDID()
    }
  })
  let tile: string
  before(async () => {
    tile = (await createTile()).id.toString()
  })
  describe('commits', () => {
    test
      .stdout()
      // .command(['stream:commits', tile])
      .it('loads all known commits', async (ctx) => {
        await Commits.run([tile])
        expect(ctx.stdout).to.contain('Stream commits loaded.')
      })
  })
  describe('state', () => {
    test
      .stdout()
      // .command(['stream:state', tile])
      .it('displays the requested streamID state', async (ctx) => {
        await State.run([tile])
        expect(ctx.stdout).to.contain('Successfully queried stream')
      })
  })
})
