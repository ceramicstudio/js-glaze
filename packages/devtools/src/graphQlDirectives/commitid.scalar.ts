import { GraphQLScalarType } from 'graphql'

export const CeramicCommitID = new GraphQLScalarType({
  name: 'CommitID',
  description: 'A field whose value is a Ceramic commit ID',
})
