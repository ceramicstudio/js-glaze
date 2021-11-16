import { expect, test } from '@oclif/test'

import { makeDID, createTile, globalKey } from '../test'

import Add from '../../src/commands/pin/add'
import Remove from '../../src/commands/pin/rm'
import List from '../../src/commands/pin/ls'

describe('pins', () => {
  let id: string
  before(async () => {
    if (!globalKey) {
      await makeDID()
    }
    const tile = await createTile()
    id = tile.id.toString()
  })

  describe('add', () => {
    test.stdout().it('pins the stream.', async (ctx) => {
      await Add.run([id])
      expect(ctx.stdout).to.contain('Stream pinned.')
    })
  })
  describe('remove', () => {
    test.stdout().it('unpins the stream', async (ctx) => {
      await Remove.run([id])
      expect(ctx.stdout).to.contain('Stream unpinned')
    })
  })
  describe('list', () => {
    test.stdout().it('list all pinned streamIDs', async (ctx) => {
      await List.run([])
      expect(ctx.stdout).to.contain('Loaded pins list.')
    })
  })
})
