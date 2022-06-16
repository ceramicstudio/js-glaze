export const compositeExample = `
type ImageMetadata {
  src: String! @length(max: 150)
  mimeType: String! @length(max: 50)
  width: Int! @intRange(min: 1)
  height: Int! @intRange(min: 1)
  size: Int @intRange(min: 1)
}

type ImageSources {
  original: ImageMetadata!
  alternatives: [ImageMetadata] @arrayLength(max: 10)
}

type GenericProfile @model(
  accountRelation: LINK,
  description: "A model to store common profile-related properties"
) {
  name: String @length(max: 150)
  image: ImageSources
}
 
type SocialProfile @model(
  accountRelation: LINK,
  description: "A model to store properties that accounts would like to share on social media"
) {
  description: String @length(max: 420)
  emoji: String @length(max: 2)
  background: ImageSources
  url: String @length(max: 240)
}

type PersonProfile @model(
  accountRelation: LINK,
  description: "A model to store accounts' personal data"
) {
  birthDate: String @length(max: 10)
  gender: String @length(max: 42)
  homeLocation: String @length(max: 140)
  residenceCountry: String @length(max: 2)
  nationalities: [String] @arrayLength(min:1, max: 5) @length(max: 2)
  affiliations: [String] @arrayLength(max: 100) @length(max: 140)
}

type Post @model(
  accountRelation: LINK,
  description: "A model to store account's posts"
) {
  author: DID! @documentAccount
  text: String! @length(max: 1000)
}

type PostComment @model(
  accountRelation: LINK,
  description: "A model to store account's comments on posts"
) {
  author: DID! @documentAccount
  postStreamId: StreamReference!
  text: String! @length(max: 240)
}

type CeramicContact @model(
  accountRelation: LINK,
  description: "A model to store account's contacts (understood as other ceramic accounts)"
) {
  owner: DID! @documentAccount
  contact: DID!
}

type TextDocument @model(
  accountRelation: LINK,
  description: "A model to store text documents"
) {
  latestAcceptedVersion: StreamReference @documentVersion
}
`
