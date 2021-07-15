/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { model } from '../src'

test('3box-essentials model', () => {
  expect(model).toEqual({
    schemas: {
      AlsoKnownAs: expect.any(Object),
      BasicProfile: expect.any(Object),
      CryptoAccounts: expect.any(Object),
      ThreeIdKeychain: expect.any(Object),
    },
    definitions: {
      alsoKnownAs: expect.any(Object),
      basicProfile: expect.any(Object),
      cryptoAccounts: expect.any(Object),
      threeIdKeychain: expect.any(Object),
    },
    tiles: {},
  })
})
