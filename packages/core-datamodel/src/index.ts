import type { ModelTypeAliases, EncodedSignedModel } from '@glazed/types'

export type Definition<C extends Record<string, any> = Record<string, any>> = {
  name: string
  description: string
  schema: string
  url?: string
  config?: C
}

export type IdentityIndex = Record<string, string>

export type ModelTypes = ModelTypeAliases<{
  Definition: Definition
  IdentityIndex: IdentityIndex
}>

export const model: EncodedSignedModel = {
  definitions: {},
  schemas: {
    Definition: [
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
    IdentityIndex: [
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
  },
  tiles: {},
}
