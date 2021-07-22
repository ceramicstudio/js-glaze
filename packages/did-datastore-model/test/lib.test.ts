/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { model } from '../src'

test('DID DataStore model', () => {
  expect(model).toEqual({
    schemas: {
      kjzl6cwe1jw14amy1imkbql1d61u00q9cbvhy5c3jtv3nz552fshl013530rauh: {
        alias: 'DataStoreIdentityIndex',
        commits: [expect.any(Object)],
        dependencies: {},
        version: 'k3y52l7qbv1fryjn62sggjh1lpn11c56qfofzmty190d62hwk1cal1c7qc5he54ow',
      },
      kjzl6cwe1jw1482rpzfuczmbqkxnevw3risxar23d7z2majhkm9pouujiov58tq: {
        alias: 'DataStoreDefinition',
        commits: [expect.any(Object)],
        dependencies: {},
        version: 'k3y52l7qbv1fry1fp4s0nwdarh0vahusarpposgevy0pemiykymd2ord6swtharcw',
      },
    },
    definitions: {},
    tiles: {},
  })
})
