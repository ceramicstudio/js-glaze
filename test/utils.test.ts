import DocID from '@ceramicnetwork/docid'
import { DIDDocument } from 'did-resolver'

import { getIDXRoot, toDocIDString } from '../src/utils'

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

  test('toDocIDString', () => {
    const docID = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexp60s'
    expect(toDocIDString(docID)).toBe(docID)
    expect(toDocIDString(DocID.fromString(docID))).toBe(docID)
  })
})
