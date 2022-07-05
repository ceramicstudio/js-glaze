import { CommitID } from '@ceramicnetwork/streamid'
import { GraphQLError, GraphQLScalarType, Kind } from 'graphql'

function validateCommitID(input: unknown): string {
  return CommitID.fromString(input as string).toString()
}

export const CeramicCommitID = new GraphQLScalarType({
  name: 'CeramicCommitID',
  description: 'A Ceramic Commit ID',
  serialize: validateCommitID,
  parseValue: validateCommitID,
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Can only validate strings as CommitID but got a: ${ast.kind}`)
    }
    return validateCommitID(ast.value)
  },
})
