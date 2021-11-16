import { TileDocument } from '@ceramicnetwork/stream-tile'
import { expect, test } from '@oclif/test'

import { makeDID, createTile, globalKey } from '../test'

import CreateTile from '../../src/commands/tile/create'
import DeterministicTile from '../../src/commands/tile/deterministic'
import ShowTile from '../../src/commands/tile/show'
import UpdateTile from '../../src/commands/tile/update'

beforeEach(async () => {
  if (!globalKey) {
    await makeDID()
  }
})

describe('tiles', () => {
  describe('create', () => {
    test
      .stdout()
      .it('should prompt the user to run the command again, providing a did key', async (ctx) => {
        await CreateTile.run(['{"FOO":"BAR"}'])
        expect(ctx.stdout).to.contain(
          'DID is not authenticated, make sure to provide a seed using the "did-key"'
        )
      })
    test.stdout().it('creates a tile.', async (ctx) => {
      await CreateTile.run(['{"FOO":"BAR"}', `--key=${globalKey}`])
      expect(ctx.stdout).to.contain('Created stream')
    })
  })

  describe('deterministic', () => {
    test.stdout().it('does not create a deterministic tile.', async (ctx) => {
      await DeterministicTile.run(['{}'])
      expect(ctx.stdout).to.contain(
        '⠋ Loading stream...✖ Family and/or tags are required when creating a deterministic tile document\n'
      )
    })

    test.stdout().it('create a deterministic tile', async (ctx) => {
      await DeterministicTile.run([
        `{"controllers": ["${globalKey}"], "tags": ["foo", "bar"], "family": ["baz"]}`,
        `--key=${globalKey}`,
      ])
      console.log('CREATE DETERMINISTIC TILE', ctx.stdout)
      expect(ctx.stdout).to.contain('Loaded stream')
    })
  })

  describe('show', () => {
    let tile: TileDocument
    before(async () => {
      tile = await createTile()
    })
    test.stdout().it('displays tile data.', async (ctx) => {
      await ShowTile.run([tile.id.toString()])
      expect(ctx.stdout).to.contain(`Retrieved details of stream ${tile.id.toString()}`)
    })
  })

  describe('update', () => {
    let tile: TileDocument
    before(async () => {
      tile = await createTile()
    })
    test
      .stdout()
      // .command(['tile:update', tile.id.toString(), '{ "FOO": "BAZ" }', '-k', globalKey])
      .it('updates the tile', async (ctx) => {
        await UpdateTile.run([`${tile.id.toString()}`, '{ "FOO": "BAZ" }', `--key=${globalKey}`])
        expect(ctx.stdout).to.contain('Updated stream')
      })
  })
})
