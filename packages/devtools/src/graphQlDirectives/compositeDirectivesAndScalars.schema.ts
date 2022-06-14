export const compositeDirectivesAndScalarsSchema = `
# From graphql-scalars
scalar DID

# Custom Ceramic scalars
scalar StreamReference


# Field validation directives

# For arrays
directive @arrayLength(min: Int, max: Int!) on FIELD_DEFINITION
# For strings and arrays
directive @length(min: Int = 0, max: Int!) on FIELD_DEFINITION
# For integers and floats
directive @intRange(min: Int, max: Int) on FIELD_DEFINITION
directive @floatRange(min: Float, max: Float) on FIELD_DEFINITION

# Model definition

enum ModelAccountRelation {
  LIST # Account to multiple streams - default
  LINK # Account to single stream (IDX)
  NONE # Indexing explicitly disabled
}
directive @model(
  accountRelation: ModelAccountRelation = LIST
  description: String!
) on OBJECT
`
