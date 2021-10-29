/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

import { TileLoader } from '@glazed/tile-loader'
import type { TileLoaderParams } from '@glazed/tile-loader'

import { DataModel } from '../src'
import type { DataModelParams } from '../src'

const Loader = TileLoader as jest.MockedClass<typeof TileLoader>

jest.mock('@glazed/tile-loader')

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
  type Params = DataModelParams<typeof aliases>

  describe('constructor', () => {
    test('uses the provided loader', () => {
      const loader = new TileLoader({ ceramic: {} } as unknown as TileLoaderParams)
      const model = new DataModel({ loader } as unknown as Params)
      expect(model.loader).toBe(loader)
    })

    test('creates the loader in constructor', () => {
      const loader = {}
      Loader.mockImplementationOnce(() => loader as unknown as TileLoader)
      const params = { cache: true, ceramic: {} }
      const model = new DataModel(params as unknown as Params)
      expect(Loader).toBeCalledWith(params)
      expect(model.loader).toBe(loader)
    })

    test('throws if no loader or ceramic instance is provided', () => {
      expect(() => {
        new DataModel({} as unknown as Params)
      }).toThrow('Invalid DataModel parameters: missing ceramic or loader')
    })
  })

  describe('Aliases methods', () => {
    test('getDefinitionID()', () => {
      const model = new DataModel({ ceramic: {}, model: aliases } as unknown as Params)
      expect(model.getDefinitionID('myFoo')).toBe('fooDefinitionID')
      // @ts-expect-error invalid definition alias
      expect(model.getDefinitionID('other')).toBeNull()
    })

    test('getSchemaURL()', () => {
      const model = new DataModel({ ceramic: {}, model: aliases } as unknown as Params)
      expect(model.getSchemaURL('Foo')).toBe('FooSchemaURL')
      // @ts-expect-error invalid schema alias
      expect(model.getSchemaURL('Other')).toBeNull()
    })

    test('getTileID()', () => {
      const model = new DataModel({ ceramic: {}, model: aliases } as unknown as Params)
      expect(model.getTileID('foo')).toBe('fooTileID')
      // @ts-expect-error invalid tile alias
      expect(model.getTileID('other')).toBeNull()
    })
  })

  describe('TileDocument wrappers', () => {
    describe('loadTile()', () => {
      test('throws if the alias does not exist', async () => {
        const model = new DataModel({ ceramic: {}, model: aliases } as unknown as Params)
        // @ts-expect-error invalid tile alias
        await expect(model.loadTile('unknown')).rejects.toThrow(
          'Tile alias "unknown" is not defined'
        )
      })

      test('returns the loaded tile', async () => {
        const stream = {}
        const load = jest.fn(() => Promise.resolve(stream))
        Loader.mockImplementationOnce(() => ({ load } as unknown as TileLoader))

        const model = new DataModel({ ceramic: {}, model: aliases } as unknown as Params)
        await expect(model.loadTile('foo')).resolves.toBe(stream)
        expect(load).toHaveBeenCalledWith('fooTileID')
      })
    })

    describe('createTile()', () => {
      test('throws if the alias does not exist', async () => {
        const model = new DataModel({ ceramic: {}, model: aliases } as unknown as Params)
        // @ts-expect-error invalid schema alias
        await expect(model.createTile('Unknown', {})).rejects.toThrow(
          'Schema alias "Unknown" is not defined'
        )
      })

      test('returns the created tile', async () => {
        const stream = { id: 'streamID' }
        const create = jest.fn(() => Promise.resolve(stream))
        Loader.mockImplementationOnce(() => ({ create } as unknown as TileLoader))

        const content = { test: true }
        const model = new DataModel({ ceramic: {}, model: aliases } as unknown as Params)
        await expect(model.createTile('Foo', content)).resolves.toBe(stream)
        expect(create).toHaveBeenCalledWith(content, { schema: 'FooSchemaURL' }, { pin: true })
      })

      test('does not pin if explicitly set', async () => {
        const stream = { id: 'streamID' }
        const create = jest.fn(() => Promise.resolve(stream))
        Loader.mockImplementationOnce(() => ({ create } as unknown as TileLoader))

        const content = { test: true }
        const model = new DataModel({ ceramic: {}, model: aliases } as unknown as Params)
        await expect(model.createTile('Foo', content, { pin: false })).resolves.toBe(stream)
        expect(create).toHaveBeenCalledWith(content, { schema: 'FooSchemaURL' }, { pin: false })
      })

      test('does not pin if autopin is false', async () => {
        const stream = { id: 'streamID' }
        const create = jest.fn(() => Promise.resolve(stream))
        Loader.mockImplementationOnce(() => ({ create } as unknown as TileLoader))

        const content = { test: true }
        const model = new DataModel({
          ceramic: {},
          model: aliases,
          autopin: false,
        } as unknown as Params)
        await expect(model.createTile('Foo', content)).resolves.toBe(stream)
        expect(create).toHaveBeenCalledWith(content, { schema: 'FooSchemaURL' }, { pin: false })
      })

      test('pins if autopin is false but option is set', async () => {
        const stream = { id: 'streamID' }
        const create = jest.fn(() => Promise.resolve(stream))
        Loader.mockImplementationOnce(() => ({ create } as unknown as TileLoader))

        const content = { test: true }
        const model = new DataModel({
          ceramic: {},
          model: aliases,
          autopin: false,
        } as unknown as Params)
        await expect(model.createTile('Foo', content, { pin: true })).resolves.toBe(stream)
        expect(create).toHaveBeenCalledWith(content, { schema: 'FooSchemaURL' }, { pin: true })
      })
    })
  })
})
