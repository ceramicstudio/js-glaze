/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

import { TileLoader } from '@glazed/tile-loader'
import type { TileLoaderParams } from '@glazed/tile-loader'
import { jest } from '@jest/globals'
import { CommitID, StreamID } from '@ceramicnetwork/streamid'

import { DataModel } from '../src'
import type { DataModelParams } from '../src'

describe('DataModel', () => {
  const streamID = new StreamID(
    1,
    'bagcqcerakszw2vsovxznyp5gfnpdj4cqm2xiv76yd24wkjewhhykovorwo6a'
  ).toString()

  const aliases = {
    schemas: {
      Foo: new CommitID(1, 'bagcqcerakszw2vsovxznyp5gfnpdj4cqm2xiv76yd24wkjewhhykovorwo6a').toUrl(),
    },
    definitions: {
      myFoo: streamID,
    },
    tiles: {
      foo: streamID,
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
      const params = { cache: true, ceramic: {} }
      const model = new DataModel(params as unknown as Params)
      expect(model.loader).toBeInstanceOf(TileLoader)
    })

    test('throws if no loader or ceramic instance is provided', () => {
      expect(() => {
        new DataModel({} as unknown as Params)
      }).toThrow('Invalid DataModel parameters: missing ceramic or loader')
    })
  })

  describe('getters', () => {
    test('aliases', () => {
      const model = new DataModel({ ceramic: {}, aliases } as unknown as Params)
      expect(model.aliases).toBe(aliases)
    })
  })

  describe('Aliases methods', () => {
    test('getDefinitionID()', () => {
      const model = new DataModel({ ceramic: {}, aliases } as unknown as Params)
      expect(model.getDefinitionID('myFoo')).toBe(aliases.definitions.myFoo)
      // @ts-expect-error invalid definition alias
      expect(model.getDefinitionID('other')).toBeNull()
    })

    test('getSchemaURL()', () => {
      const model = new DataModel({ ceramic: {}, aliases } as unknown as Params)
      expect(model.getSchemaURL('Foo')).toBe(aliases.schemas.Foo)
      // @ts-expect-error invalid schema alias
      expect(model.getSchemaURL('Other')).toBeNull()
    })

    test('getTileID()', () => {
      const model = new DataModel({ ceramic: {}, aliases } as unknown as Params)
      expect(model.getTileID('foo')).toBe(aliases.tiles.foo)
      // @ts-expect-error invalid tile alias
      expect(model.getTileID('other')).toBeNull()
    })
  })

  describe('TileDocument wrappers', () => {
    describe('loadTile()', () => {
      test('throws if the alias does not exist', async () => {
        const model = new DataModel({ ceramic: {}, aliases } as unknown as Params)
        // @ts-expect-error invalid tile alias
        await expect(model.loadTile('unknown')).rejects.toThrow(
          'Tile alias "unknown" is not defined'
        )
      })

      test('returns the loaded tile', async () => {
        const stream = {}
        const load = jest.fn(() => Promise.resolve(stream))
        const model = new DataModel({
          ceramic: {},
          loader: { load },
          aliases,
        } as unknown as Params)
        await expect(model.loadTile('foo')).resolves.toBe(stream)
        expect(load).toHaveBeenCalledWith(aliases.definitions.myFoo)
      })
    })

    describe('createTile()', () => {
      test('throws if the alias does not exist', async () => {
        const model = new DataModel({ ceramic: {}, aliases } as unknown as Params)
        // @ts-expect-error invalid schema alias
        await expect(model.createTile('Unknown', {})).rejects.toThrow(
          'Schema alias "Unknown" is not defined'
        )
      })

      test('returns the created tile', async () => {
        const stream = { id: streamID }
        const create = jest.fn(() => Promise.resolve(stream))
        const model = new DataModel({
          ceramic: {},
          loader: { create },
          aliases,
        } as unknown as Params)

        const content = { test: true }
        await expect(model.createTile('Foo', content, { pin: false })).resolves.toBe(stream)
        expect(create).toHaveBeenCalledWith(
          content,
          { schema: aliases.schemas.Foo },
          { pin: false }
        )
      })

      test('with custom controller', async () => {
        const stream = { id: streamID }
        const create = jest.fn(() => Promise.resolve(stream))
        const model = new DataModel({
          ceramic: {},
          loader: { create },
          aliases,
        } as unknown as Params)

        const content = { test: true }
        await model.createTile('Foo', content, { controller: 'did:test:123' })
        expect(create).toHaveBeenCalledWith(
          content,
          { schema: aliases.schemas.Foo, controllers: ['did:test:123'] },
          {}
        )
      })
    })
  })
})
