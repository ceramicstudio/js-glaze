import StreamID from '@ceramicnetwork/streamid'

import { toDocIDString } from '../src/utils'

describe('utils', () => {
  test('toDocIDString', () => {
    const streamID = 'kjzl6cwe1jw147dvq16zluojmraqvwdmbh61dx9e0c59i344lcrsgqfohexp60s'
    expect(toDocIDString(streamID)).toBe(streamID)
    expect(toDocIDString(StreamID.fromString(streamID))).toBe(streamID)
  })
})
