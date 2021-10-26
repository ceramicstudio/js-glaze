/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

import { TileDocument } from '@ceramicnetwork/stream-tile'

import { DataModel } from '../src'

// eslint-disable-next-line @typescript-eslint/unbound-method
const createTile = TileDocument.create as jest.MockedFunction<typeof TileDocument.create>
// eslint-disable-next-line @typescript-eslint/unbound-method
const loadTile = TileDocument.load as jest.MockedFunction<typeof TileDocument.load>

jest.mock('@ceramicnetwork/stream-tile')

describe('DataModel', () => {
  const aliases = {
    schemas: {
      Foo: 'FooSchemaURL',
    },
    definitions: {
      myFoo: 'fooDefinitionID',
    },
    tiles: {
      foo: 'fooTileID',
    },
  }

  test('`ceramic` property', () => {
    const ceramic = {}
    const model = new DataModel({ ceramic } as any)
    expect(model.ceramic).toBe(ceramic)
  })

  describe('Aliases methods', () => {
    test('getDefinitionID()', () => {
      const model = new DataModel({ ceramic: {}, model: aliases } as any)
      expect(model.getDefinitionID('myFoo')).toBe('fooDefinitionID')
      expect(model.getDefinitionID('other')).toBeNull()
    })

    test('getSchemaURL()', () => {
      const model = new DataModel({ ceramic: {}, model: aliases } as any)
      expect(model.getSchemaURL('Foo')).toBe('FooSchemaURL')
      expect(model.getSchemaURL('Other')).toBeNull()
    })

    test('getTileID()', () => {
      const model = new DataModel({ ceramic: {}, model: aliases } as any)
      expect(model.getTileID('foo')).toBe('fooTileID')
      expect(model.getTileID('other')).toBeNull()
    })
  })

  describe('TileDocument wrappers', () => {
    describe('loadTile()', () => {
      test('throws if the alias does not exist', async () => {
        const model = new DataModel({ ceramic: {}, model: aliases } as any)
        await expect(model.loadTile('unknown')).rejects.toThrow(
          'Tile alias "unknown" is not defined'
        )
      })

      test('returns the loaded tile', async () => {
        const ceramic = {}
        const stream = {}
        const load = jest.fn(() => Promise.resolve(stream))
        loadTile.mockImplementationOnce(load as unknown as typeof TileDocument.load)

        const model = new DataModel({ ceramic, model: aliases } as any)
        await expect(model.loadTile('foo')).resolves.toBe(stream)
        expect(load).toHaveBeenCalledWith(ceramic, 'fooTileID')
      })
    })

    describe('createTile()', () => {
      test('throws if the alias does not exist', async () => {
        const model = new DataModel({ ceramic: {}, model: aliases } as any)
        await expect(model.createTile('Unknown', {})).rejects.toThrow(
          'Schema alias "Unknown" is not defined'
        )
      })

      test('returns the created tile', async () => {
        const stream = { id: 'streamID' }
        const create = jest.fn(() => Promise.resolve(stream))
        createTile.mockImplementationOnce(create as unknown as typeof TileDocument.create)

        const ceramic = {
          pin: { add: jest.fn() },
        }
        const content = { test: true }

        const model = new DataModel({ ceramic, model: aliases } as any)
        await expect(model.createTile('Foo', content)).resolves.toBe(stream)
        expect(create).toHaveBeenCalledWith(ceramic, content, { schema: 'FooSchemaURL' })
        expect(ceramic.pin.add).toHaveBeenCalledWith('streamID')
      })

      test('does not pin if explicitly set', async () => {
        const stream = { id: 'streamID' }
        const create = jest.fn(() => Promise.resolve(stream))
        createTile.mockImplementationOnce(create as unknown as typeof TileDocument.create)

        const ceramic = {
          pin: { add: jest.fn() },
        }
        const content = { test: true }

        const model = new DataModel({ ceramic, model: aliases } as any)
        await expect(model.createTile('Foo', content, { pin: false })).resolves.toBe(stream)
        expect(create).toHaveBeenCalledWith(ceramic, content, { schema: 'FooSchemaURL' })
        expect(ceramic.pin.add).not.toHaveBeenCalled()
      })

      test('does not pin if autopin is false', async () => {
        const stream = { id: 'streamID' }
        const create = jest.fn(() => Promise.resolve(stream))
        createTile.mockImplementationOnce(create as unknown as typeof TileDocument.create)

        const ceramic = {
          pin: { add: jest.fn() },
        }
        const content = { test: true }

        const model = new DataModel({ ceramic, model: aliases, autopin: false } as any)
        await expect(model.createTile('Foo', content)).resolves.toBe(stream)
        expect(create).toHaveBeenCalledWith(ceramic, content, { schema: 'FooSchemaURL' })
        expect(ceramic.pin.add).not.toHaveBeenCalled()
      })

      test('pins if autopin is false but option is set', async () => {
        const stream = { id: 'streamID' }
        const create = jest.fn(() => Promise.resolve(stream))
        createTile.mockImplementationOnce(create as unknown as typeof TileDocument.create)

        const ceramic = {
          pin: { add: jest.fn() },
        }
        const content = { test: true }

        const model = new DataModel({ ceramic, model: aliases, autopin: false } as any)
        await expect(model.createTile('Foo', content, { pin: true })).resolves.toBe(stream)
        expect(create).toHaveBeenCalledWith(ceramic, content, { schema: 'FooSchemaURL' })
        expect(ceramic.pin.add).toHaveBeenCalledWith('streamID')
      })
    })
  })
})
