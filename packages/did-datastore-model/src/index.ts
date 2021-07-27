import type { ModelTypeAliases, EncodedManagedModel } from '@glazed/types'

export type Definition<C extends Record<string, any> = Record<string, any>> = {
  name: string
  description: string
  schema: string
  url?: string
  config?: C
}

export type IdentityIndex = Record<string, string>

export type ModelTypes = ModelTypeAliases<{
  DataStoreDefinition: Definition
  DataStoreIndex: IdentityIndex
}>

export const model: EncodedManagedModel = {
  definitions: {},
  schemas: {
    kjzl6cwe1jw1482rpzfuczmbqkxnevw3risxar23d7z2majhkm9pouujiov58tq: {
      alias: 'DataStoreDefinition',
      commits: [
        {
          jws: {
            payload: 'AXESIGVBGu8EHXq5fxC16J4MwEPBCfrWq1bsZWQP2F_WWhT0',
            signatures: [
              {
                protected:
                  'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3NOWUU2V3RNWjNXTGJQd2NwOUdtN2RUN0ozRHNOUDhhdVFOblBwUUJ1MzdBI3o2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QSJ9',
                signature:
                  'hvv_KWbyYbg7ZP8PQeJxPjHnlAg1VKtPjVa6zXwMq9pug96qGcXFQi5XUAl30RH4QYOHl8Gpv4uZczWxAJllAg',
              },
            ],
            link: 'bafyreidfieno6ba5pk4x6efv5cpazqcdyee7vvvlk3wgkzap3bp5mwqu6q',
          },
          linkedBlock:
            'o2RkYXRhpmR0eXBlZm9iamVjdGV0aXRsZWpEZWZpbml0aW9uZyRzY2hlbWF4J2h0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDcvc2NoZW1hI2hyZXF1aXJlZINkbmFtZWtkZXNjcmlwdGlvbmZzY2hlbWFqcHJvcGVydGllc6VjdXJsomR0eXBlZnN0cmluZ2ltYXhMZW5ndGgY8GRuYW1lomR0eXBlZnN0cmluZ2ltYXhMZW5ndGgYlmZjb25maWehZHR5cGVmb2JqZWN0ZnNjaGVtYaFkJHJlZngaIy9kZWZpbml0aW9ucy9DZXJhbWljRG9jSWRrZGVzY3JpcHRpb26iZHR5cGVmc3RyaW5naW1heExlbmd0aBkBpGtkZWZpbml0aW9uc6FsQ2VyYW1pY0RvY0lko2R0eXBlZnN0cmluZ2dwYXR0ZXJueBxeY2VyYW1pYzovLy4rKFw/dmVyc2lvbj0uKyk/aW1heExlbmd0aBiWZmhlYWRlcqJmc2NoZW1h92tjb250cm9sbGVyc4F4OGRpZDprZXk6ejZNa3NOWUU2V3RNWjNXTGJQd2NwOUdtN2RUN0ozRHNOUDhhdVFOblBwUUJ1MzdBZ2RvY3R5cGVkdGlsZQ==',
        },
      ],
      dependencies: {},
      version: 'k3y52l7qbv1fry1fp4s0nwdarh0vahusarpposgevy0pemiykymd2ord6swtharcw',
    },
    kjzl6cwe1jw14amy1imkbql1d61u00q9cbvhy5c3jtv3nz552fshl013530rauh: {
      alias: 'DataStoreIndex',
      commits: [
        {
          jws: {
            payload: 'AXESIKO29HNjXsFTO9Bbs5VTTGqJUPZ9Aoic83L6G0ziXp48',
            signatures: [
              {
                protected:
                  'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3NOWUU2V3RNWjNXTGJQd2NwOUdtN2RUN0ozRHNOUDhhdVFOblBwUUJ1MzdBI3o2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QSJ9',
                signature:
                  'R-VH5EwcOsvd3Txsl4Pjw-QSobjiNJuQVPWrbubyX6uIbe2SRupKx5od0z2agdeVnglt9L9mHiOqlRGgI7WNDQ',
              },
            ],
            link: 'bafyreifdw32hgy26yfjtxuc3wokvgtdkrfipm7icrcopg4x2dngoexu6hq',
          },
          linkedBlock:
            'o2RkYXRhpWR0eXBlZm9iamVjdGV0aXRsZW1JZGVudGl0eUluZGV4ZyRzY2hlbWF4J2h0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDcvc2NoZW1hI2tkZWZpbml0aW9uc6FsQ2VyYW1pY0RvY0lko2R0eXBlZnN0cmluZ2dwYXR0ZXJueBxeY2VyYW1pYzovLy4rKFw/dmVyc2lvbj0uKyk/aW1heExlbmd0aBiWdGFkZGl0aW9uYWxQcm9wZXJ0aWVzoWQkcmVmeBojL2RlZmluaXRpb25zL0NlcmFtaWNEb2NJZGZoZWFkZXKiZnNjaGVtYfdrY29udHJvbGxlcnOBeDhkaWQ6a2V5Ono2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QWdkb2N0eXBlZHRpbGU=',
        },
      ],
      dependencies: {},
      version: 'k3y52l7qbv1fryjn62sggjh1lpn11c56qfofzmty190d62hwk1cal1c7qc5he54ow',
    },
  },
  tiles: {},
}
