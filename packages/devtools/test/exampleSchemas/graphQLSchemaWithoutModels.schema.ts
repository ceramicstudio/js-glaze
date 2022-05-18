export const graphQLSchemaWithoutModels = `
type ImageMetadata {
  src: URL! @ipfs
  mimeType: String! @length(max: 50)
  width: PositiveInt!
  height: PositiveInt!
  size: PositiveInt
}
`