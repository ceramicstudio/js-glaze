/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

import { IDX } from '../src/index'
jest.mock('@ceramicnetwork/stream-tile')

// TODO: update to mock internal model/store

describe('IDX', () => {
  describe('properties', () => {
    test('`authenticated` property', () => {
      const idx1 = new IDX({ ceramic: {} } as any)
      expect(idx1.authenticated).toBe(false)

      const idx2 = new IDX({ ceramic: { did: {} } } as any)
      expect(idx2.authenticated).toBe(true)
    })

    test('`ceramic` property', () => {
      const ceramic = {}
      const idx = new IDX({ ceramic } as any)
      expect(idx.ceramic).toBe(ceramic)
    })

    test('`id` property', () => {
      const idx1 = new IDX({ ceramic: {} } as any)
      expect(() => idx1.id).toThrow('Ceramic instance is not authenticated')

      const idx2 = new IDX({ ceramic: { did: { id: 'did:test' } } } as any)
      expect(idx2.id).toBe('did:test')
    })
  })

  describe('Main methods', () => {
    test('has', async () => {
      const storeHas = jest.fn(() => Promise.resolve(true))
      const idx = new IDX({ aliases: { test: 'streamId' } } as any)
      idx._store = { has: storeHas } as any
      await expect(idx.has('test', 'did')).resolves.toBe(true)
      expect(storeHas).toBeCalledWith('streamId', 'did')
    })

    test('get', async () => {
      const content = {}
      const storeGet = jest.fn(() => Promise.resolve(content))
      const idx = new IDX({ aliases: { test: 'streamId' } } as any)
      idx._store = { get: storeGet } as any
      await expect(idx.get('test', 'did')).resolves.toBe(content)
      expect(storeGet).toBeCalledWith('streamId', 'did')
    })

    test('set', async () => {
      const content = {}
      const options = {}
      const storeSet = jest.fn(() => Promise.resolve('definitionId'))
      const idx = new IDX({ aliases: { test: 'streamId' } } as any)
      idx._store = { set: storeSet } as any
      await expect(idx.set('test', content, options)).resolves.toBe('definitionId')
      expect(storeSet).toBeCalledWith('streamId', content, options)
    })

    test('merge', async () => {
      const content = {}
      const options = {}
      const storeMerge = jest.fn(() => Promise.resolve('definitionId'))
      const idx = new IDX({ aliases: { test: 'streamId' } } as any)
      idx._store = { merge: storeMerge } as any
      await expect(idx.merge('test', content, options)).resolves.toBe('definitionId')
      expect(storeMerge).toBeCalledWith('streamId', content, options)
    })

    test('setAll', async () => {
      const res = { test: 'test', basicProfile: 'profile', other: 'other' }
      const setAll = jest.fn(() => Promise.resolve(res))
      const options = {}
      const idx = new IDX({ aliases: { test: 'streamId' } } as any)
      idx._store = { setAll } as any
      await expect(
        idx.setAll(
          { test: { test: true }, basicProfile: { name: 'bob' }, other: { foo: 'bar' } },
          options
        )
      ).resolves.toBe(res)
      expect(setAll).toBeCalledWith(
        {
          streamId: { test: true },
          kjzl6cwe1jw145cjbeko9kil8g9bxszjhyde21ob8epxuxkaon1izyqsu8wgcic: { name: 'bob' },
          other: { foo: 'bar' },
        },
        options
      )
    })

    test('setDefaults', async () => {
      const res = { test: 'test', basicProfile: 'profile', other: 'other' }
      const setDefaults = jest.fn(() => Promise.resolve(res))
      const options = {}
      const idx = new IDX({ aliases: { test: 'streamId' } } as any)
      idx._store = { setDefaults } as any
      await expect(
        idx.setDefaults(
          {
            test: { test: true },
            basicProfile: { name: 'bob' },
            other: { foo: 'bar' },
          },
          options
        )
      ).resolves.toBe(res)
      expect(setDefaults).toBeCalledWith(
        {
          streamId: { test: true },
          kjzl6cwe1jw145cjbeko9kil8g9bxszjhyde21ob8epxuxkaon1izyqsu8wgcic: { name: 'bob' },
          other: { foo: 'bar' },
        },
        options
      )
    })

    test('remove', async () => {
      const storeRemove = jest.fn(() => Promise.resolve())
      const idx = new IDX({ aliases: { test: 'streamId' } } as any)
      idx._store = { remove: storeRemove } as any
      await expect(idx.remove('test')).resolves.toBeUndefined()
      expect(storeRemove).toBeCalledWith('streamId')
    })
  })

  describe('_toIndexKey', () => {
    test('returns explicit alias first', () => {
      const idx = new IDX({ aliases: { basicProfile: 'basicProfileAliasID' } } as any)
      expect(idx._toIndexKey('basicProfile')).toBe('basicProfileAliasID')
    })

    test('returns 3Box essentials alias if set', () => {
      const idx = new IDX({} as any)
      expect(idx._toIndexKey('basicProfile')).toBe(
        'kjzl6cwe1jw145cjbeko9kil8g9bxszjhyde21ob8epxuxkaon1izyqsu8wgcic'
      )
    })

    test('returns input as fallback', () => {
      const idx = new IDX({} as any)
      expect(idx._toIndexKey('unknown')).toBe('unknown')
    })
  })

  describe('Proxies to store APIs', () => {
    test('getIndex', async () => {
      const res = {}
      const proxy = jest.fn(() => Promise.resolve(res))
      const idx = new IDX({} as any)
      idx._store = { getIndex: proxy } as any
      await expect(idx.getIndex('did')).resolves.toBe(res)
      expect(proxy).toBeCalledWith('did')
    })

    test('iterator', () => {
      const res = {}
      const proxy = jest.fn(() => res)
      const idx = new IDX({} as any)
      idx._store = { iterator: proxy } as any
      expect(idx.iterator('did')).toBe(res)
      expect(proxy).toBeCalledWith('did')
    })

    test('getDefinition', async () => {
      const res = {}
      const proxy = jest.fn(() => Promise.resolve(res))
      const idx = new IDX({} as any)
      idx._store = { getDefinition: proxy } as any
      await expect(idx.getDefinition('id')).resolves.toBe(res)
      expect(proxy).toBeCalledWith('id')
    })

    test('getRecordID', async () => {
      const res = {}
      const proxy = jest.fn(() => Promise.resolve(res))
      const idx = new IDX({} as any)
      idx._store = { getRecordID: proxy } as any
      await expect(idx.getRecordID('id', 'did')).resolves.toBe(res)
      expect(proxy).toBeCalledWith('id', 'did')
    })

    test('getRecordDocument', async () => {
      const res = {}
      const proxy = jest.fn(() => Promise.resolve(res))
      const idx = new IDX({} as any)
      idx._store = { getRecordDocument: proxy } as any
      await expect(idx.getRecordDocument('id', 'did')).resolves.toBe(res)
      expect(proxy).toBeCalledWith('id', 'did')
    })
  })
})
