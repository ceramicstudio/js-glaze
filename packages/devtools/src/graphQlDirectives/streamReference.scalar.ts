import {
  GraphQLScalarType,
  Kind,
  GraphQLError,
} from 'graphql';

export const GraphQLStreamReference = new GraphQLScalarType({
  name: 'StreamReference',
  description: 'A field whose value is a ceramic stream id or commit id',
  serialize(value) { return value },
  parseValue(value) { return value },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(
        `Can only validate strings as StreamReference but got a: ${ast.kind}`,
      );
    }
    return ast.value;
  }
})
