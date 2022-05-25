import { GraphQLScalarType } from 'graphql'

export const GraphQLStreamReference = new GraphQLScalarType({
  name: 'StreamReference',
  description: 'A field whose value is a ceramic stream id or commit id',
})
