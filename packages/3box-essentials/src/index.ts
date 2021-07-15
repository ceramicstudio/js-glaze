import type { ModelTypeAliases, EncodedSignedModel } from '@glazed/types'

export type Attestation = {
  'did-jwt'?: string
  'did-jwt-vc'?: string
}

export type AlsoKnownAsAccount = {
  protocol: string
  id: string
  host?: string
  claim?: string
  attestations?: Array<Attestation>
}

export type AlsoKnownAs = {
  accounts: Array<AlsoKnownAsAccount>
}

export type ImageMetadata = {
  src: string
  mimeType: string
  width: number
  height: number
  size?: number
}

export type ImageSources = {
  original: ImageMetadata
  alternatives?: Array<ImageMetadata>
}

export type BasicProfile = {
  name?: string
  image?: ImageSources
  description?: string
  emoji?: string
  background?: ImageSources
  birthDate?: string
  url?: string
  gender?: string
  homeLocation?: string
  residenceCountry?: string
  nationalities?: Array<string>
  affiliations?: Array<string>
}

export type CryptoAccounts = Record<string, string>

export type JWERecipient = {
  header: Record<string, any>
  encrypted_key: string
}

export type JWE = {
  protected: string
  iv: string
  ciphertext: string
  tag: string
  aad?: string
  recipients?: Array<JWERecipient>
}

export type WrappedJWE = { jwe: JWE }

export type AuthData = {
  id: WrappedJWE
  pub: string
  data: WrappedJWE
}

export type ThreeIdKeychain = {
  authMap: Record<string, AuthData>
  pastSeeds: Array<JWE>
}

export type ModelTypes = ModelTypeAliases<
  {
    AlsoKnownAs: AlsoKnownAs
    BasicProfile: BasicProfile
    CryptoAccounts: CryptoAccounts
    ThreeIdKeychain: ThreeIdKeychain
  },
  {
    alsoKnownAs: 'AlsoKnownAs'
    basicProfile: 'BasicProfile'
    cryptoAccounts: 'CryptoAccounts'
    threeIdKeychain: 'ThreeIdKeychain'
  }
>

export const model: EncodedSignedModel<ModelTypes> = {
  definitions: {
    alsoKnownAs: [
      {
        jws: {
          payload: 'AXESIOWmE0CF2MHEz0PmBVBOkCvzCVXNE5Mg-894RRaXaZJe',
          signatures: [
            {
              protected:
                'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3NOWUU2V3RNWjNXTGJQd2NwOUdtN2RUN0ozRHNOUDhhdVFOblBwUUJ1MzdBI3o2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QSJ9',
              signature:
                'GurUQxUEzBdidKjlPdv09NLD-aG787p47ghUMW2PA5av49soVKe3I4xntq4OzXHXm-weLzuMFUFxkURvgUDuAA',
            },
          ],
          link: 'bafyreihfuyjubboyyhcm6q7gavie5ebl6mevltitsmqpxt3yiuljo2msly',
        },
        linkedBlock:
          'o2RkYXRho2RuYW1lbUFsc28gS25vd24gQXNmc2NoZW1heEtjZXJhbWljOi8vazN5NTJsN3FidjFmcnlvanQ4bjhjdzJrMDRwOXdwNjdseTU5aXdxczY1ZGVqc281NjZmaWo1d3NkcmI4NzF5aW9rZGVzY3JpcHRpb254ZEFsc28gS25vd24gQXMgaXMgYSBkYXRhIHNldCB0aGF0IHN0b3JlcyBhIGxpc3Qgb2YgYWNjb3VudHMgdGhhdCBhcmUgcHVibGljbHkgbGlua2VkIHRvIHRoZSB1c2VycyBESURmaGVhZGVyomZzY2hlbWF4S2NlcmFtaWM6Ly9rM3k1Mmw3cWJ2MWZyeTFmcDRzMG53ZGFyaDB2YWh1c2FycHBvc2dldnkwcGVtaXlreW1kMm9yZDZzd3RoYXJjd2tjb250cm9sbGVyc4F4OGRpZDprZXk6ejZNa3NOWUU2V3RNWjNXTGJQd2NwOUdtN2RUN0ozRHNOUDhhdVFOblBwUUJ1MzdBZ2RvY3R5cGVkdGlsZQ==',
      },
    ],
    basicProfile: [
      {
        jws: {
          payload: 'AXESIHQlyxvLYuiHGvjCREWnS0HxQV6z7lfPRe4mRdViHjWU',
          signatures: [
            {
              protected:
                'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3NOWUU2V3RNWjNXTGJQd2NwOUdtN2RUN0ozRHNOUDhhdVFOblBwUUJ1MzdBI3o2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QSJ9',
              signature:
                '619cILy5j-zkYwz0pJ2cYnPnVqmYf6YJcuqxcLoaRqvCL341HOoTm0siEOG_Jmu1alT_UUuah1dlrqubgIe1BA',
            },
          ],
          link: 'bafyreiduexfrxs3c5cdrv6gcirc2os2b6fav5m7ok7hul3rgixkwehrvsq',
        },
        linkedBlock:
          'o2RkYXRho2RuYW1lbUJhc2ljIFByb2ZpbGVmc2NoZW1heEtjZXJhbWljOi8vazN5NTJsN3FidjFmcnh0NzA2Z3Fmem1xNmNicWRrcHR6azh1dWRhcnlobGtmNmx5OXZ4MjFocXU0cjZrMWpxaW9rZGVzY3JpcHRpb254I0Jhc2ljIHByb2ZpbGUgaW5mb3JtYXRpb24gZm9yIGEgRElEZmhlYWRlcqJmc2NoZW1heEtjZXJhbWljOi8vazN5NTJsN3FidjFmcnkxZnA0czBud2RhcmgwdmFodXNhcnBwb3NnZXZ5MHBlbWl5a3ltZDJvcmQ2c3d0aGFyY3drY29udHJvbGxlcnOBeDhkaWQ6a2V5Ono2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QWdkb2N0eXBlZHRpbGU=',
      },
    ],
    cryptoAccounts: [
      {
        jws: {
          payload: 'AXESIILyy1_0_U8dXhlxpyWOMxBDKion3W2mMbfS5WmuL-Xb',
          signatures: [
            {
              protected:
                'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3NOWUU2V3RNWjNXTGJQd2NwOUdtN2RUN0ozRHNOUDhhdVFOblBwUUJ1MzdBI3o2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QSJ9',
              signature:
                'IKbedepBBpEdE9DKx6WjCYYyFdo9mfgv422_vLlT8vusBGM-P7YiEn6t3iYHrMi-dzrnE4Lp8wY0aqhFnDuWCA',
            },
          ],
          link: 'bafyreiec6lfv75h5j4ov4glru4sy4myqimvcuj65nwtddn6s4vu24l7f3m',
        },
        linkedBlock:
          'o2RkYXRho2RuYW1lb0NyeXB0byBBY2NvdW50c2ZzY2hlbWF4S2NlcmFtaWM6Ly9rM3k1Mmw3cWJ2MWZyeXB1c3NqYnVycWc0ZnlreXl5Y2Z1MHA5em5jNzVsdjJ0NWNnNHhhc2xoYWdrZDdoN21rZ2tkZXNjcmlwdGlvbngiQ3J5cHRvIGFjY291bnRzIGxpbmtlZCB0byB5b3VyIERJRGZoZWFkZXKiZnNjaGVtYXhLY2VyYW1pYzovL2szeTUybDdxYnYxZnJ5MWZwNHMwbndkYXJoMHZhaHVzYXJwcG9zZ2V2eTBwZW1peWt5bWQyb3JkNnN3dGhhcmN3a2NvbnRyb2xsZXJzgXg4ZGlkOmtleTp6Nk1rc05ZRTZXdE1aM1dMYlB3Y3A5R203ZFQ3SjNEc05QOGF1UU5uUHBRQnUzN0FnZG9jdHlwZWR0aWxl',
      },
    ],
    threeIdKeychain: [
      {
        jws: {
          payload: 'AXESIGyI_q2lZeGlUOHKcp--mfAyATQxgGxLVs6czea19pDb',
          signatures: [
            {
              protected:
                'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3NOWUU2V3RNWjNXTGJQd2NwOUdtN2RUN0ozRHNOUDhhdVFOblBwUUJ1MzdBI3o2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QSJ9',
              signature:
                'Ozhsz077CUps_NHDd_8g4OD3lbysXtJQDZWTpzeBfwjZ5mqDv_uvPPYkhJuld6N0hWTSBi7y6K2iNHYlDdfqCA',
            },
          ],
          link: 'bafyreidmrd7k3jlf4gsvbyokokp35gpqgiatimmanrfvntu4zxtll5uq3m',
        },
        linkedBlock:
          'o2RkYXRho2RuYW1lbDNJRCBLZXljaGFpbmZzY2hlbWF4S2NlcmFtaWM6Ly9rM3k1Mmw3cWJ2MWZyeGlvZGZvNmYyNXdvY2I4eno2MHl3cXc0c3FjcHJzMjZxeDFxeDQ2N2w0eWJ4cGx5YnZnZ2tkZXNjcmlwdGlvbnBLZXkgZGF0YSBmb3IgM0lEZmhlYWRlcqJmc2NoZW1heEtjZXJhbWljOi8vazN5NTJsN3FidjFmcnkxZnA0czBud2RhcmgwdmFodXNhcnBwb3NnZXZ5MHBlbWl5a3ltZDJvcmQ2c3d0aGFyY3drY29udHJvbGxlcnOBeDhkaWQ6a2V5Ono2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QWdkb2N0eXBlZHRpbGU=',
      },
    ],
  },
  schemas: {
    AlsoKnownAs: [
      {
        jws: {
          payload: 'AXESIALdl9Z9fNLBS6NfkZ2JRIClBQFb0cIi2rVwS1Kie2k1',
          signatures: [
            {
              protected:
                'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3NOWUU2V3RNWjNXTGJQd2NwOUdtN2RUN0ozRHNOUDhhdVFOblBwUUJ1MzdBI3o2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QSJ9',
              signature:
                'bg4CcLmHGYPYsRvl_EObk2HgtOjijDNBJrOzupI2NMT-n_3Wj4GaUn83wA2IqTtql5uZRpgBYqxOjGdH4GB6CA',
            },
          ],
          link: 'bafyreiac3wl5m7l42lauxi27sgoysreauucqcw6ryirnvnlqjnjke63jgu',
        },
        linkedBlock:
          'o2RkYXRhp2R0eXBlZm9iamVjdGV0aXRsZWtBbHNvS25vd25Bc2ckc2NoZW1heCdodHRwOi8vanNvbi1zY2hlbWEub3JnL2RyYWZ0LTA3L3NjaGVtYSNocmVxdWlyZWSBaGFjY291bnRzanByb3BlcnRpZXOhaGFjY291bnRzomR0eXBlZWFycmF5ZWl0ZW1zoWQkcmVmdSMvZGVmaW5pdGlvbnMvQWNjb3VudGtkZWZpbml0aW9uc6JnQWNjb3VudKNkdHlwZWZvYmplY3RocmVxdWlyZWSCaHByb3RvY29sYmlkanByb3BlcnRpZXOlYmlkomR0eXBlZnN0cmluZ2ltYXhMZW5ndGgZAcJkaG9zdKJkdHlwZWZzdHJpbmdpbWF4TGVuZ3RoGJZlY2xhaW2iZHR5cGVmc3RyaW5naW1heExlbmd0aBkBwmhwcm90b2NvbKJkdHlwZWZzdHJpbmdpbWF4TGVuZ3RoGDJsYXR0ZXN0YXRpb25zomR0eXBlZWFycmF5ZWl0ZW1zoWQkcmVmeBkjL2RlZmluaXRpb25zL0F0dGVzdGF0aW9ua0F0dGVzdGF0aW9uomR0eXBlZm9iamVjdGpwcm9wZXJ0aWVzomdkaWQtand0omR0eXBlZnN0cmluZ2ltYXhMZW5ndGgZA+hqZGlkLWp3dC12Y6JkdHlwZWZzdHJpbmdpbWF4TGVuZ3RoGQPodGFkZGl0aW9uYWxQcm9wZXJ0aWVz9GZoZWFkZXKiZnNjaGVtYfdrY29udHJvbGxlcnOBeDhkaWQ6a2V5Ono2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QWdkb2N0eXBlZHRpbGU=',
      },
    ],
    BasicProfile: [
      {
        jws: {
          payload: 'AXESIMy4lYCUWSpzFW5jKQ0mYJOQ67EQnv5Exuv3F599h-et',
          signatures: [
            {
              protected:
                'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3NOWUU2V3RNWjNXTGJQd2NwOUdtN2RUN0ozRHNOUDhhdVFOblBwUUJ1MzdBI3o2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QSJ9',
              signature:
                'yeEnzWKALkvTn_X7wjgL3ldLW8I8vWANs5QZmqI6PGbU5AJl12eIuWyID-mRPuGF9flovtGNX1P-qKkc6Y8JBA',
            },
          ],
          link: 'bafyreigmxckybfczfjzrk3tdfegsmyetsdv3cee67zcmn27xc6px3b7hvu',
        },
        linkedBlock:
          'o2RkYXRhpWR0eXBlZm9iamVjdGV0aXRsZWxCYXNpY1Byb2ZpbGVnJHNjaGVtYXgnaHR0cDovL2pzb24tc2NoZW1hLm9yZy9kcmFmdC0wNy9zY2hlbWEjanByb3BlcnRpZXOsY3VybKJkdHlwZWZzdHJpbmdpbWF4TGVuZ3RoGPBkbmFtZaJkdHlwZWZzdHJpbmdpbWF4TGVuZ3RoGJZlZW1vammiZHR5cGVmc3RyaW5naW1heExlbmd0aAJlaW1hZ2WhZCRyZWZ4GiMvZGVmaW5pdGlvbnMvaW1hZ2VTb3VyY2VzZmdlbmRlcqJkdHlwZWZzdHJpbmdpbWF4TGVuZ3RoGCppYmlydGhEYXRlo2R0eXBlZnN0cmluZ2Zmb3JtYXRkZGF0ZWltYXhMZW5ndGgKamJhY2tncm91bmShZCRyZWZ4GiMvZGVmaW5pdGlvbnMvaW1hZ2VTb3VyY2Vza2Rlc2NyaXB0aW9uomR0eXBlZnN0cmluZ2ltYXhMZW5ndGgZAaRsYWZmaWxpYXRpb25zomR0eXBlZWFycmF5ZWl0ZW1zomR0eXBlZnN0cmluZ2ltYXhMZW5ndGgYjGxob21lTG9jYXRpb26iZHR5cGVmc3RyaW5naW1heExlbmd0aBiMbW5hdGlvbmFsaXRpZXOjZHR5cGVlYXJyYXllaXRlbXOjZHR5cGVmc3RyaW5nZ3BhdHRlcm5qXltBLVpdezJ9JGhtYXhJdGVtcwVobWluSXRlbXMBcHJlc2lkZW5jZUNvdW50cnmjZHR5cGVmc3RyaW5nZ3BhdHRlcm5qXltBLVpdezJ9JGltYXhMZW5ndGgCa2RlZmluaXRpb25zpGdJUEZTVXJso2R0eXBlZnN0cmluZ2dwYXR0ZXJual5pcGZzOi8vLitpbWF4TGVuZ3RoGJZsaW1hZ2VTb3VyY2Vzo2R0eXBlZm9iamVjdGhyZXF1aXJlZIFob3JpZ2luYWxqcHJvcGVydGllc6Job3JpZ2luYWyhZCRyZWZ4GyMvZGVmaW5pdGlvbnMvaW1hZ2VNZXRhZGF0YWxhbHRlcm5hdGl2ZXOiZHR5cGVlYXJyYXllaXRlbXOhZCRyZWZ4GyMvZGVmaW5pdGlvbnMvaW1hZ2VNZXRhZGF0YW1pbWFnZU1ldGFkYXRho2R0eXBlZm9iamVjdGhyZXF1aXJlZIRjc3JjaG1pbWVUeXBlZXdpZHRoZmhlaWdodGpwcm9wZXJ0aWVzpWNzcmOhZCRyZWZ1Iy9kZWZpbml0aW9ucy9JUEZTVXJsZHNpemWhZCRyZWZ4HSMvZGVmaW5pdGlvbnMvcG9zaXRpdmVJbnRlZ2VyZXdpZHRooWQkcmVmeB0jL2RlZmluaXRpb25zL3Bvc2l0aXZlSW50ZWdlcmZoZWlnaHShZCRyZWZ4HSMvZGVmaW5pdGlvbnMvcG9zaXRpdmVJbnRlZ2VyaG1pbWVUeXBlomR0eXBlZnN0cmluZ2ltYXhMZW5ndGgYMm9wb3NpdGl2ZUludGVnZXKiZHR5cGVnaW50ZWdlcmdtaW5pbXVtAWZoZWFkZXKiZnNjaGVtYfdrY29udHJvbGxlcnOBeDhkaWQ6a2V5Ono2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QWdkb2N0eXBlZHRpbGU=',
      },
    ],
    CryptoAccounts: [
      {
        jws: {
          payload: 'AXESIF-4Olz6gzTYrKPZj_7buHaUsueU-P0K67cq6kHlJphd',
          signatures: [
            {
              protected:
                'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3NOWUU2V3RNWjNXTGJQd2NwOUdtN2RUN0ozRHNOUDhhdVFOblBwUUJ1MzdBI3o2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QSJ9',
              signature:
                'WMNOLmFwYUcYg-dhzg_zkFYit2j7hdYY4_NvcRy_4q_CJmfj8WOxTeHRQ1HqdXkXVycg_Q4JmtqUG992Cdf2CA',
            },
          ],
          link: 'bafyreic7xa5fz6udgtmkzi6zr77nxodwsszopfhy7ufoxnzk5ja6kjuylu',
        },
        linkedBlock:
          'o2RkYXRhpmR0eXBlZm9iamVjdGV0aXRsZXJDcnlwdG9BY2NvdW50TGlua3NnJHNjaGVtYXgnaHR0cDovL2pzb24tc2NoZW1hLm9yZy9kcmFmdC0wNy9zY2hlbWEjbXByb3BlcnR5TmFtZXOhaW1heExlbmd0aBkEAHFwYXR0ZXJuUHJvcGVydGllc6F4OF5bYS16QS1aMC05XXsxLDYzfUBbLWEtekEtWjAtOV17MywxNn06Wy1hLXpBLVowLTldezEsNDd9o2R0eXBlZnN0cmluZ2dwYXR0ZXJubV5jZXJhbWljOi8vLitpbWF4TGVuZ3RoGQQAdGFkZGl0aW9uYWxQcm9wZXJ0aWVz9GZoZWFkZXKiZnNjaGVtYfdrY29udHJvbGxlcnOBeDhkaWQ6a2V5Ono2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QWdkb2N0eXBlZHRpbGU=',
      },
    ],
    ThreeIdKeychain: [
      {
        jws: {
          payload: 'AXESIDpfdAEsNb76jO9057sDPODcniYXUcxAdlhQXEqr4BBB',
          signatures: [
            {
              protected:
                'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3NOWUU2V3RNWjNXTGJQd2NwOUdtN2RUN0ozRHNOUDhhdVFOblBwUUJ1MzdBI3o2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QSJ9',
              signature:
                'Zir2mHf-si2EIGZIMryci6V9hJxEHBLWesBVLzqkl5hlw0DyoBVvVpK5HN_QiozIMCbagPx2v1aLhKb_dNujDw',
            },
          ],
          link: 'bafyreib2l52aclbvx35iz33u465qgpha3spcmf2rzrahmwcqlrfkxyaqie',
        },
        linkedBlock:
          'o2RkYXRhpWR0eXBlZm9iamVjdGckc2NoZW1heCdodHRwOi8vanNvbi1zY2hlbWEub3JnL2RyYWZ0LTA3L3NjaGVtYSNqcHJvcGVydGllc6JnYXV0aE1hcKJkdHlwZWZvYmplY3R0YWRkaXRpb25hbFByb3BlcnRpZXOhZCRyZWZ2Iy9kZWZpbml0aW9ucy9BdXRoRGF0YWlwYXN0U2VlZHOiZHR5cGVlYXJyYXllaXRlbXOhZCRyZWZxIy9kZWZpbml0aW9ucy9KV0VrZGVmaW5pdGlvbnOjY0pXRaRkdHlwZWZvYmplY3RldGl0bGVjSldFaHJlcXVpcmVkhGlwcm90ZWN0ZWRiaXZqY2lwaGVydGV4dGN0YWdqcHJvcGVydGllc6ZiaXahZHR5cGVmc3RyaW5nY2FhZKFkdHlwZWZzdHJpbmdjdGFnoWR0eXBlZnN0cmluZ2lwcm90ZWN0ZWShZHR5cGVmc3RyaW5namNpcGhlcnRleHShZHR5cGVmc3RyaW5nanJlY2lwaWVudHOiZHR5cGVlYXJyYXllaXRlbXOjZHR5cGVmb2JqZWN0aHJlcXVpcmVkgmZoZWFkZXJtZW5jcnlwdGVkX2tleWpwcm9wZXJ0aWVzomZoZWFkZXKhZHR5cGVmb2JqZWN0bWVuY3J5cHRlZF9rZXmhZHR5cGVmc3RyaW5naEF1dGhEYXRho2R0eXBlZm9iamVjdGpwcm9wZXJ0aWVzo2JpZKFkJHJlZngYIy9kZWZpbml0aW9ucy9XcmFwcGVkSldFY3B1YqFkdHlwZWZzdHJpbmdkZGF0YaFkJHJlZngYIy9kZWZpbml0aW9ucy9XcmFwcGVkSldFdGFkZGl0aW9uYWxQcm9wZXJ0aWVz9GpXcmFwcGVkSldFo2R0eXBlZm9iamVjdGpwcm9wZXJ0aWVzoWNqd2WhZCRyZWZxIy9kZWZpbml0aW9ucy9KV0V0YWRkaXRpb25hbFByb3BlcnRpZXP0dGFkZGl0aW9uYWxQcm9wZXJ0aWVz9GZoZWFkZXKiZnNjaGVtYfdrY29udHJvbGxlcnOBeDhkaWQ6a2V5Ono2TWtzTllFNld0TVozV0xiUHdjcDlHbTdkVDdKM0RzTlA4YXVRTm5QcFFCdTM3QWdkb2N0eXBlZHRpbGU=',
      },
    ],
  },
  tiles: {},
}
