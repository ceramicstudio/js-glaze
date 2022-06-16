export const graphQLSchemaWithoutModels = `
type ImageMetadata {
  src: String! @length(max: 50)
  mimeType: String! @length(max: 50)
  width: Int! @intRange(min: 0)
  height: Int! @intRange(min: 0)
  size: Int @intRange(min: 0)
}
`
