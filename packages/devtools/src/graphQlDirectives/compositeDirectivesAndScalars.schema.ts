export const compositeDirectivesAndScalarsSchema = `
# From graphql-scalars
scalar DID

# Custom Ceramic scalars
scalar StreamReference


# Field validation directives

# For strings
directive @length(min: Int = 0, max: Int!) on FIELD_DEFINITION
# For string and arrays
directive @arrayLength(min: Int, max: Int!) on FIELD_DEFINITION
# For integers and floats
directive @intRange(min: Int, max: Int) on FIELD_DEFINITION
directive @floatRange(min: Float, max: Float) on FIELD_DEFINITION

# Model definition

enum ModelAccountRelation {
  LIST # Account to multiple streams - default
  SET # FUTURE - Account to multiple streams but only one reference
  LINK # Account to single stream (IDX)
  NONE # Indexing explicitly disabled
}
directive @model(
  accountRelation: ModelAccountRelation = LIST
  description: String!
) on OBJECT
# FUTURE - When a model has index = SET, at least one field must have the @index directive
directive @index on FIELD_DEFINITION
`
