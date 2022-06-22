export const ImageMetadataType = `
type ImageMetadata {
  src: String! @length(max: 150)
  mimeType: String! @length(max: 50)
  width: Int! @intRange(min: 1)
  height: Int! @intRange(min: 1)
  size: Int @intRange(min: 1)
}
`

export const ImageSourcesType = `
${ImageMetadataType}

type ImageSources {
  original: ImageMetadata!
  alternatives: [ImageMetadata]
}
`

export const noteSchema = `
type Note @model(accountRelation: LIST, description: "Simple text note") {
  author: DID! @documentAccount
  title: String! @length(min: 10, max: 100)
  text: String! @length(max: 2000)
}
`

export const profilesSchema = `
${ImageSourcesType}

type GenericProfile @model(
  accountRelation: SINGLE,
  description: "A model to store common profile-related properties"
) {
  name: String @length(max: 150)
  image: ImageSources
}
 
type SocialProfile @model(
  accountRelation: SINGLE,
  description: "A model to store properties that accounts would like to share on social media"
) {
  description: String @length(max: 420)
  emoji: String @length(max: 2)
  background: ImageSources
  url: String @length(max: 240)
}

type PersonProfile @model(
  accountRelation: SINGLE,
  description: "A model to store accounts' personal data"
) {
  birthDate: String @length(max: 10)
  gender: String @length(max: 42)
  homeLocation: String @length(max: 140)
  residenceCountry: String @length(max: 2)
  nationalities: [String] @arrayLength(min:1, max: 5)
  affiliations: [String] @length(max: 140)
}
`
