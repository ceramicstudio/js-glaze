import { DIDDocument } from 'did-resolver'

import { getIDXRoot } from '../src/utils'

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
})
