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
  AlsoKnownAs: 'ceramic://k3y52l7qbv1fryojt8n8cw2k04p9wp67ly59iwqs65dejso566fij5wsdrb871yio',
  BasicProfile: 'ceramic://k3y52l7qbv1frxt706gqfzmq6cbqdkptzk8uudaryhlkf6ly9vx21hqu4r6k1jqio',
  CryptoAccounts: 'ceramic://k3y52l7qbv1frypussjburqg4fykyyycfu0p9znc75lv2t5cg4xaslhagkd7h7mkg',
  Definition: 'ceramic://k3y52l7qbv1fry1fp4s0nwdarh0vahusarpposgevy0pemiykymd2ord6swtharcw',
  IdentityIndex: 'ceramic://k3y52l7qbv1fryjn62sggjh1lpn11c56qfofzmty190d62hwk1cal1c7qc5he54ow',
  ThreeIdKeychain: 'ceramic://k3y52l7qbv1frxiodfo6f25wocb8zz60ywqw4sqcprs26qx1qx467l4ybxplybvgg',
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
  alsoKnownAs: 'kjzl6cwe1jw146zfmqa10a5x1vry6au3t362p44uttz4l0k4hi88o41zplhmxnf',
  basicProfile: 'kjzl6cwe1jw145cjbeko9kil8g9bxszjhyde21ob8epxuxkaon1izyqsu8wgcic',
  cryptoAccounts: 'kjzl6cwe1jw149z4rvwzi56mjjukafta30kojzktd9dsrgqdgz4wlnceu59f95f',
  threeIdKeychain: 'kjzl6cwe1jw14a50gupo0d433e9ojgmj9rd9ejxkc8vq6lw0fznsoohwzmejqs8',
}
