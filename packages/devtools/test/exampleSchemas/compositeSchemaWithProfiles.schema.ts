export const compositeSchemaWithProfiles = `
type ImageMetadata {
  src: URL! @ipfs @length(max: 150)
  mimeType: String! @length(max: 50)
  width: PositiveInt!
  height: PositiveInt!
  size: PositiveInt
}

type ImageSources {
  original: ImageMetadata!
  alternatives: [ImageMetadata]
}

type GenericProfile @model(index: LINK) {
  name: String @length(max: 150)
  image: ImageSources
}
 
type SocialProfile @model(index: LINK, description: "A social profile model") {
  description: String @length(max: 420)
  emoji: String @length(max: 2)
  background: ImageSources
  url: URL @length(max: 240)
}

type PersonProfile @model(index: LINK) {
  birthDate: Date @length(max: 10)
  gender: String @length(max: 42)
  homeLocation: String @length(max: 140)
  residenceCountry: CountryCode
  nationalities: [CountryCode] @length(min:1, max: 5)
  affiliations: [String] @itemLength(max: 140)
}
`