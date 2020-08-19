import { createAccessors, loadIDXDoc } from '../src/accessors'
import { IDX } from '../src/index'

describe('accessors', () => {
  describe('loadIDXDoc', () => {
    test('load doc using the provided id', async () => {
      const ceramicDoc = { content: { type: 'Ceramic doc' } }
      const loadCeramicDocument = jest.fn(() => Promise.resolve(ceramicDoc))
      const rootDoc = { content: { accounts: 'ceramic://accountsId' } }
      const getRootDocument = jest.fn(() => Promise.resolve(rootDoc))
      const idx = ({ getRootDocument, loadCeramicDocument } as unknown) as IDX
      await expect(loadIDXDoc(idx, 'accounts', 'did:any:test')).resolves.toBe(ceramicDoc)
      expect(getRootDocument).toHaveBeenCalledWith('did:any:test')
      expect(loadCeramicDocument).toHaveBeenCalledWith('ceramic://accountsId')
    })

    test('load own doc using the authenticated id', async () => {
      const ownDoc = { content: { type: 'IDX doc' } }
      const getOwnDocument = jest.fn(() => Promise.resolve(ownDoc))
      const idx = ({
        authenticated: true,
        user: { DID: 'did:any:test' },
        getOwnDocument
      } as unknown) as IDX
      await expect(loadIDXDoc(idx, 'accounts')).resolves.toBe(ownDoc)
      expect(getOwnDocument).toHaveBeenCalledWith('accounts')
    })

    test('load own doc if provided id matches the authenticated one', async () => {
      const ownDoc = { content: { type: 'IDX doc' } }
      const getOwnDocument = jest.fn(() => Promise.resolve(ownDoc))
      const idx = ({
        authenticated: true,
        user: { DID: 'did:any:test' },
        getOwnDocument
      } as unknown) as IDX
      await expect(loadIDXDoc(idx, 'accounts', 'did:any:test')).resolves.toBe(ownDoc)
      expect(getOwnDocument).toHaveBeenCalledWith('accounts')
    })

    test('load doc using the provided id when it does not match the authenticated one', async () => {
      const ceramicDoc = { content: { type: 'Ceramic doc' } }
      const loadCeramicDocument = jest.fn(() => Promise.resolve(ceramicDoc))
      const rootDoc = { content: { accounts: 'ceramic://accountsId' } }
      const getRootDocument = jest.fn(() => Promise.resolve(rootDoc))
      const idx = ({
        authenticated: true,
        user: { DID: 'did:any:other' },
        getRootDocument,
        loadCeramicDocument
      } as unknown) as IDX
      await expect(loadIDXDoc(idx, 'accounts', 'did:any:test')).resolves.toBe(ceramicDoc)
      expect(getRootDocument).toHaveBeenCalledWith('did:any:test')
      expect(loadCeramicDocument).toHaveBeenCalledWith('ceramic://accountsId')
    })

    test('throws an error when no id is provided', async () => {
      const idx = ({} as unknown) as IDX
      await expect(loadIDXDoc(idx, 'accounts')).rejects.toThrow('User is not authenticated')
    })
  })

  describe('createAccessors', () => {
    test('list unauthenticated', async () => {
      const doc = { content: { type: 'Ceramic doc', another: 'test' } }
      const loadCeramicDocument = jest.fn(() => Promise.resolve(doc))
      const rootDoc = { content: { accounts: 'ceramic://accountsId' } }
      const getRootDocument = jest.fn(() => Promise.resolve(rootDoc))
      const idx = ({ getRootDocument, loadCeramicDocument } as unknown) as IDX
      const accessors = createAccessors('accounts', idx)
      await expect(accessors.list('did:any:test')).resolves.toEqual(['type', 'another'])
    })

    test('list authenticated', async () => {
      const doc = { content: { type: 'Ceramic doc', test: 'test' } }
      const getOwnDocument = jest.fn(() => Promise.resolve(doc))
      const idx = ({ authenticated: true, getOwnDocument } as unknown) as IDX
      const accessors = createAccessors('accounts', idx)
      await expect(accessors.list()).resolves.toEqual(['type', 'test'])
    })

    test('get unauthenticated', async () => {
      const doc = { content: { type: 'Ceramic doc', another: 'one' } }
      const loadCeramicDocument = jest.fn(() => Promise.resolve(doc))
      const rootDoc = { content: { accounts: 'ceramic://accountsId' } }
      const getRootDocument = jest.fn(() => Promise.resolve(rootDoc))
      const idx = ({ getRootDocument, loadCeramicDocument } as unknown) as IDX
      const accessors = createAccessors('accounts', idx)
      await expect(accessors.get('did:any:test', 'another')).resolves.toBe('one')
    })

    test('get authenticated', async () => {
      const doc = { content: { type: 'Ceramic doc', test: 'test' } }
      const getOwnDocument = jest.fn(() => Promise.resolve(doc))
      const idx = ({ authenticated: true, getOwnDocument } as unknown) as IDX
      const accessors = createAccessors('accounts', idx)
      await expect(accessors.get('test')).resolves.toBe('test')
    })

    test('set', async () => {
      const content = { hello: 'test' }
      const changeOwnDocument = jest.fn((name, changeFunc) => {
        return changeFunc(content)
      })
      const idx = ({ changeOwnDocument } as unknown) as IDX
      const accessors = createAccessors('accounts', idx)
      await accessors.set('hello', 'world')
      expect(changeOwnDocument).toBeCalledWith('accounts', expect.any(Function))
      expect(changeOwnDocument).toReturnWith({ hello: 'world' })
    })

    test('remove', async () => {
      const content = { hello: 'test', another: 'one' }
      const changeOwnDocument = jest.fn((name, changeFunc) => {
        return changeFunc(content)
      })
      const idx = ({ changeOwnDocument } as unknown) as IDX
      const accessors = createAccessors('accounts', idx)
      await accessors.remove('another')
      expect(changeOwnDocument).toBeCalledWith('accounts', expect.any(Function))
      expect(changeOwnDocument).toReturnWith({ hello: 'test' })
    })
  })
})
