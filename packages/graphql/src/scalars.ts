import { StreamRef } from '@ceramicnetwork/streamid'
import { GraphQLError, GraphQLScalarType, Kind } from 'graphql'

function validateStreamRef(input: unknown): string {
  return StreamRef.from(input as string).toString()
}

export const CeramicStreamReference = new GraphQLScalarType({
  name: 'CeramicStreamReference',
  description: 'A Ceramic Stream reference (Stream or Commit ID)',
  serialize: validateStreamRef,
  parseValue: validateStreamRef,
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Can only validate strings as StreamRef but got a: ${ast.kind}`)
    }
    return validateStreamRef(ast.value)
  },
})
