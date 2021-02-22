type PublishedRecord<K extends string> = Record<K, string>

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

export type Definition<C extends Record<string, any> = Record<string, any>> = {
  name: string
  description: string
  schema: string
  url?: string
  config?: C
}

export type IdentityIndex = Record<string, string>

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

export type SchemaTypes = {
  AlsoKnownAs: AlsoKnownAs
  BasicProfile: BasicProfile
  CryptoAccounts: CryptoAccounts
  Definition: Definition
  IdentityIndex: IdentityIndex
  ThreeIdKeychain: ThreeIdKeychain
}
export type SchemaName = keyof SchemaTypes
export type SchemaType<K extends SchemaName> = SchemaTypes[K]
export type PublishedSchemas = PublishedRecord<SchemaName>

export const schemas: PublishedSchemas = {
  AlsoKnownAs: 'ceramic://k3y52l7qbv1frxntajkc5s2n19ldseabk41lyb5hytx7r1ntb9uhf2bav9qqcrvgg',
  BasicProfile: 'ceramic://k3y52l7qbv1frxjdr9qpn9ldvbxb0jg4eig7wtjkdu6gk84vyazw9j4txf4o6d2io',
  CryptoAccounts: 'ceramic://k3y52l7qbv1fry6z45y9s2w5npe0nyokbp0oiv1tdhvswhv07lb2v13zdz4i1bp4w',
  Definition: 'ceramic://k3y52l7qbv1fry4h28r53ebkeym2mxf1i23f303ql3gs1oqovfml44scaukncpxc0',
  IdentityIndex: 'ceramic://k3y52l7qbv1frxrcmx299lbnc5txfo4b7tls1rm5vf7luc34yuztc60tibruptp8g',
  ThreeIdKeychain: 'ceramic://k3y52l7qbv1fry69sodu0hc4nwvzglaxxvy3l0xdw7v1o36gyu2dl9us472qh8veo',
}

export type DefinitionTypes = {
  alsoKnownAs: AlsoKnownAs
  basicProfile: BasicProfile
  cryptoAccounts: CryptoAccounts
  threeIdKeychain: ThreeIdKeychain
}
export type DefinitionName = keyof DefinitionTypes
export type DefinitionType<K extends DefinitionName> = DefinitionTypes[K]
export type PublishedDefinitions = PublishedRecord<DefinitionName>

export const definitions: PublishedDefinitions = {
  alsoKnownAs: 'kjzl6cwe1jw148ah60m6n4gwudo8mje9w9p06w3b8bf2g2va3i8me36nazzurc8',
  basicProfile: 'kjzl6cwe1jw14aewu2t91dwgc4ezkf74kmqe9beuxz8u1tlpjfss6nibbwbkohw',
  cryptoAccounts: 'kjzl6cwe1jw14bek5i7rcr1q9byw61w4rswrhmvja0kfos89ty0notx0vh7kx3b',
  threeIdKeychain: 'kjzl6cwe1jw14742krx8kpze2a2t25hwic331sljucncxt8g3ld8duj6cs0w7to',
}
