export const compositeDirectivesAndScalarsSchema = `
# GraphQL built-in scalars

scalar CountryCode
scalar Date
scalar DateTime
scalar DID
scalar PositiveInt
scalar Time
scalar URL

# Custom Ceramic scalars

scalar StreamID

# Field validation directives

directive @ipfs on FIELD_DEFINITION # Must be an IPFS URL
directive @length(max: Int!, min: Int = 0) on FIELD_DEFINITION # Applicable to strings
directive @itemLength(max: Int, min: Int = 0) on FIELD_DEFINITION # Applicable to arrays of strings

# Metadata access directives

directive @documentAccount on FIELD_DEFINITION
directive @documentVersion on FIELD_DEFINITION

# Model definition

enum ModelIndexType {
  LIST # Account to multiple streams - default
  SET # Account to multiple streams but only one reference
  LINK # Account to single stream (IDX)
  NONE # Indexing explicitly disabled
}
directive @model(
  index: ModelIndexType = LIST
  description: String
  url: String
) on OBJECT
# When a model has index = SET, at least one field must have the @index directive
directive @index on FIELD_DEFINITION

# Account-based relations

enum AccountLinkTarget {
  SELF
  OTHER
  BOTH
}

directive @accountLink(
  property: String!
  target: AccountLinkTarget!
) on FIELD_DEFINITION
directive @accountReference on FIELD_DEFINITION
directive @accountRelation(property: String!) on FIELD_DEFINITION

# Model-based relations

directive @modelReference(type: String!) on FIELD_DEFINITION
directive @modelRelation(property: String!) on FIELD_DEFINITION
`