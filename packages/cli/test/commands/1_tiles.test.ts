import { TileDocument } from '@ceramicnetwork/stream-tile'
import { expect, test } from '@oclif/test'

import { makeDID, createTile, globalKey } from '../utils'

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
      .stderr()
      .stdout({ print: false })
      .it('should prompt the user to run the command again, providing a did key', async (ctx) => {
        await CreateTile.run(['-b {"FOO":"BAR"}'])
        expect(ctx.stderr).to.contain(
          'DID is not authenticated, make sure to provide a seed using the "did-key"'
        )
      })
    test
      .stderr()
      .stdout({ print: false })
      .it('creates a tile.', async (ctx) => {
        await CreateTile.run(['-b {"FOO":"BAR"}', `--key=${globalKey}`])
        expect(ctx.stderr).to.contain('Created stream')
      })
  })

  describe('deterministic', () => {
    test
      .stderr()
      .stdout({ print: false })
      .it('does not create a deterministic tile.', async (ctx) => {
        await DeterministicTile.run(['{}'])
        expect(ctx.stderr).to.contain(
          '⠋ Loading stream...✖ Family and/or tags are required when creating a deterministic tile document\n'
        )
      })

    test
      .stderr()
      .stdout({ print: false })
      .it('create a deterministic tile', async (ctx) => {
        await DeterministicTile.run([
          `{"controllers": ["${globalKey}"], "tags": ["foo", "bar"], "family": ["baz"]}`,
          `--key=${globalKey}`,
        ])
        console.log('CREATE DETERMINISTIC TILE', ctx.stderr)
        expect(ctx.stderr).to.contain('Loaded stream')
      })
  })

  describe('show', () => {
    let tile: TileDocument
    beforeEach(async () => {
      tile = await createTile()
    })
    test
      .stderr()
      .stdout({ print: false })
      .it('displays tile data.', async (ctx) => {
        await ShowTile.run([tile.id.toString()])
        expect(ctx.stderr).to.contain(`Retrieved details of stream ${tile.id.toString()}`)
      })
  })

  describe('update', () => {
    let tile: TileDocument
    beforeEach(async () => {
      tile = await createTile()
    })
    test
      .stderr()
      .stdout({ print: false })
      .it('updates the tile', async (ctx) => {
        await UpdateTile.run([`${tile.id.toString()}`, '-b { "FOO": "BAZ" }', `--key=${globalKey}`])
        expect(ctx.stderr).to.contain('Updated stream')
      })
  })
})
