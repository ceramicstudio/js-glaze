import DocID from '@ceramicnetwork/docid'

import { toDocIDString } from '../src/utils'

describe('utils', () => {
  test('toDocIDString', () => {
    const docID = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexp60s'
    expect(toDocIDString(docID)).toBe(docID)
    expect(toDocIDString(DocID.fromString(docID))).toBe(docID)
  })
})
