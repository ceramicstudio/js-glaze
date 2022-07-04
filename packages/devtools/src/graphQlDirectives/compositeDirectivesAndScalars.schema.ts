import { extraScalars } from './scalars.js'

const scarlarDefinitions = Object.keys(extraScalars)
  .map((name) => `scalar ${name}`)
  .join('\n')

export const compositeDirectivesAndScalarsSchema = `
# Added scalars

${scarlarDefinitions}

# Field validation directives

# For strings
directive @length(min: Int = 0, max: Int!) on FIELD_DEFINITION
# For arrays
directive @arrayLength(min: Int, max: Int!) on FIELD_DEFINITION
# For numbers
directive @intRange(min: Int, max: Int) on FIELD_DEFINITION
directive @floatRange(min: Float, max: Float) on FIELD_DEFINITION

# Views

directive @documentAccount on FIELD_DEFINITION
directive @documentVersion on FIELD_DEFINITION

# Model definition

enum ModelAccountRelation {
  LIST # Account to multiple streams - default
  SINGLE # Account to single stream (IDX)
  NONE # Indexing explicitly disabled
}
directive @model(
  accountRelation: ModelAccountRelation = LIST
  description: String!
) on OBJECT
`
