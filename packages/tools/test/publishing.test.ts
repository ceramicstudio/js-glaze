/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import DocID from '@ceramicnetwork/docid'

import { createTile, publishCommits, publishDoc } from '../src'

describe('publishing', () => {
  const testID = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexp60s'
  const testDocID = DocID.fromString(testID)
  const testDoc = {
    id: testDocID,
    commitId: DocID.fromString('kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexp60t'),
  }

  describe('createTile', () => {
    test('throw an error if the Ceramic instance is not authenticated', async () => {
      await expect(createTile({} as any, {})).rejects.toThrow(
        'Ceramic instance is not authenticated'
      )
    })

    test('sets the authenticated DID as controllers if not set in metadata', async () => {
      const createDocument = jest.fn(() => Promise.resolve({ id: testDocID }))
      const pinAdd = jest.fn(() => Promise.resolve())
      const ceramic = { did: { id: 'did:test:123' }, createDocument, pin: { add: pinAdd } } as any

      await createTile(ceramic, { hello: 'test' }, { schema: testID })
      expect(createDocument).toBeCalledWith('tile', {
        content: { hello: 'test' },
        metadata: { controllers: ['did:test:123'], schema: testID },
      })
      expect(pinAdd).toBeCalledWith(testDocID)
    })

    test('sets the provided controllers', async () => {
      const createDocument = jest.fn(() => Promise.resolve({ id: testDocID }))
      const pinAdd = jest.fn()
      const ceramic = { did: { id: 'did:test:123' }, createDocument, pin: { add: pinAdd } } as any

      await createTile(ceramic, { hello: 'test' }, { controllers: ['did:test:456'] })
      expect(createDocument).toBeCalledWith('tile', {
        content: { hello: 'test' },
        metadata: { controllers: ['did:test:456'] },
      })
    })
  })

  test('publishCommits', async () => {
    const createDocument = jest.fn(() => Promise.resolve(testDoc))
    const applyCommit = jest.fn(() => Promise.resolve(testDoc))
    const pinAdd = jest.fn(() => Promise.resolve())
    const ceramic = {
      createDocumentFromGenesis: createDocument,
      applyCommit,
      pin: { add: pinAdd },
    } as any

    const commits = [{ jws: {}, __genesis: true }, { jws: {} }, { jws: {} }]
    const opts = { anchor: false, publish: false }
    await expect(publishCommits(ceramic, commits as any)).resolves.toBe(testDoc)
    expect(createDocument).toBeCalledWith('tile', { jws: {}, __genesis: true }, opts)
    expect(pinAdd).toBeCalledWith(testDocID)
    expect(applyCommit).toBeCalledTimes(2)
    expect(applyCommit).toBeCalledWith(testDocID, { jws: {} }, opts)
  })

  describe('publishDoc', () => {
    test('creates the document if the DocID is not provided', async () => {
      const createDocument = jest.fn(() => Promise.resolve(testDoc))
      const pinAdd = jest.fn(() => Promise.resolve())
      const ceramic = { did: { id: 'did:test:123' }, createDocument, pin: { add: pinAdd } } as any

      await expect(
        publishDoc(ceramic, {
          content: { hello: 'test' },
          controllers: ['did:test:456'],
          schema: testID,
        })
      ).resolves.toBe(testDoc)
      expect(createDocument).toBeCalledWith('tile', {
        content: { hello: 'test' },
        metadata: { controllers: ['did:test:456'], schema: testID },
      })
      expect(pinAdd).toBeCalledWith(testDocID)
    })

    test('updates the document if contents changed', async () => {
      const change = jest.fn()
      const doc = { content: { hello: 'world' }, change, id: testDocID }
      const loadDocument = jest.fn(() => Promise.resolve(doc))
      const ceramic = { loadDocument } as any

      await expect(publishDoc(ceramic, { id: testID, content: { hello: 'test' } })).resolves.toBe(
        doc
      )
      expect(loadDocument).toBeCalledWith(testID)
      expect(change).toBeCalledWith({ content: { hello: 'test' } })
    })

    test('does not update the document if contents have not changed', async () => {
      const change = jest.fn()
      const doc = { content: { hello: 'test' }, change, id: testDocID }
      const loadDocument = jest.fn(() => Promise.resolve(doc))
      const ceramic = { loadDocument } as any

      await expect(publishDoc(ceramic, { id: testID, content: { hello: 'test' } })).resolves.toBe(
        doc
      )
      expect(loadDocument).toBeCalledWith(testID)
      expect(change).not.toBeCalled()
    })
  })
})
