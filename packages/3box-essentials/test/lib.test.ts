/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { model } from '../src'

test('3box-essentials model', () => {
  expect(model).toEqual({
    schemas: {
      kjzl6cwe1jw14bbsas0m29cxrnsyesfp0v45gz9l44p3wpw86j21kio8onil8po: {
        alias: 'AlsoKnownAs',
        commits: [expect.any(Object)],
        dependencies: {},
        version: 'k3y52l7qbv1fryojt8n8cw2k04p9wp67ly59iwqs65dejso566fij5wsdrb871yio',
      },
      kjzl6cwe1jw146x1pnq7vg4t0lwea84s2a8u58tt1clfmv7mrju3l2341klxyu6: {
        alias: 'BasicProfile',
        commits: [expect.any(Object)],
        dependencies: {},
        version: 'k3y52l7qbv1frxt706gqfzmq6cbqdkptzk8uudaryhlkf6ly9vx21hqu4r6k1jqio',
      },
      kjzl6cwe1jw14bie69guriwn4hsto1gdh5q1ytpwi84xkz2b9oxkw9qs7d3v3vv: {
        alias: 'CryptoAccounts',
        commits: [expect.any(Object)],
        dependencies: {},
        version: 'k3y52l7qbv1frypussjburqg4fykyyycfu0p9znc75lv2t5cg4xaslhagkd7h7mkg',
      },
      kjzl6cwe1jw145fsw0l5hqpeo8byb4s9eqa56agevgvt2nrt3j5dfwrbsxewe1m: {
        alias: 'ThreeIdKeychain',
        commits: [expect.any(Object)],
        dependencies: {},
        version: 'k3y52l7qbv1frxiodfo6f25wocb8zz60ywqw4sqcprs26qx1qx467l4ybxplybvgg',
      },
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
    definitions: {
      kjzl6cwe1jw146zfmqa10a5x1vry6au3t362p44uttz4l0k4hi88o41zplhmxnf: {
        alias: 'alsoKnownAs',
        commits: [expect.any(Object)],
        schema: 'kjzl6cwe1jw14bbsas0m29cxrnsyesfp0v45gz9l44p3wpw86j21kio8onil8po',
        version: 'k3y52l7qbv1frxtnz5mvb60a31dyr0t232uj76lej855slfz3whmlngu5y0tf3aio',
      },
      kjzl6cwe1jw145cjbeko9kil8g9bxszjhyde21ob8epxuxkaon1izyqsu8wgcic: {
        alias: 'basicProfile',
        commits: [expect.any(Object)],
        schema: 'kjzl6cwe1jw146x1pnq7vg4t0lwea84s2a8u58tt1clfmv7mrju3l2341klxyu6',
        version: 'k3y52l7qbv1frxi15d3n0k1w703mcwe4qnof7yjwvvsogryobz7uv3r2l33as8ydc',
      },
      kjzl6cwe1jw149z4rvwzi56mjjukafta30kojzktd9dsrgqdgz4wlnceu59f95f: {
        alias: 'cryptoAccounts',
        commits: [expect.any(Object)],
        schema: 'kjzl6cwe1jw14bie69guriwn4hsto1gdh5q1ytpwi84xkz2b9oxkw9qs7d3v3vv',
        version: 'k3y52l7qbv1fryextyaykh0v4b15ca8g7pg32m500uaq4jazjspuvty09idf0h2io',
      },
      kjzl6cwe1jw14a50gupo0d433e9ojgmj9rd9ejxkc8vq6lw0fznsoohwzmejqs8: {
        alias: 'threeIdKeychain',
        commits: [expect.any(Object)],
        schema: 'kjzl6cwe1jw145fsw0l5hqpeo8byb4s9eqa56agevgvt2nrt3j5dfwrbsxewe1m',
        version: 'k3y52l7qbv1fryg3nbueiql9205guie891emavhqon35m6znn5pl7zi7elbbgegow',
      },
    },
    tiles: {},
  })
})
