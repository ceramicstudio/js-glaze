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
 
type SocialProfile @model(index: LINK) {
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
  nationalities: [CountryCode] # need a way to indicate the max item cound in an array
  affiliations: [String] #need a way to indicate the max lenghts for each item in an array
}
`