import { DIDDocument } from 'did-resolver'

import { getIDXRoot, toCeramicString, toCeramicURL } from '../src/utils'

describe('utils', () => {
  test('getIDXRoot', () => {
    const doc1 = {} as DIDDocument
    const doc2 = { service: [{ type: 'something', serviceEndpoint: 'test' }] } as DIDDocument
    const doc3 = {
      service: [
        { type: 'something', serviceEndpoint: 'test' },
        { type: 'IdentityIndexRoot', serviceEndpoint: 'ceramic://test' }
      ]
    } as DIDDocument

    expect(getIDXRoot(doc1)).toBeUndefined()
    expect(getIDXRoot(doc2)).toBeUndefined()
    expect(getIDXRoot(doc3)).toBe('ceramic://test')
  })

  test('toCeramicString', () => {
    expect(toCeramicString('test')).toBe('test')
    expect(toCeramicString('ceramic://test')).toBe('test')
  })

  test('toCeramicURL', () => {
    expect(toCeramicURL('test')).toBe('ceramic://test')
    expect(toCeramicURL('ceramic://test')).toBe('ceramic://test')
  })
})
