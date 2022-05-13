import { GraphQLScalarType, GraphQLString, ValueNode } from 'graphql'

export class CeramicStringType extends GraphQLScalarType<string> {
  constructor (
    fieldName: string,
    ceramicTypeName: string,
    args: Record<string, any>) {
    super({
      name: ceramicTypeName,
      serialize (value: unknown) {
        const serialized = GraphQLString.serialize(value)
        validateCeramicString(fieldName, args, serialized)
        return serialized
      },
      parseValue (value: unknown) {
        const parsed = GraphQLString.serialize(value)
        validateCeramicString(fieldName, args, parsed)
        return parsed
      },
      parseLiteral (ast: ValueNode) {
        const value = GraphQLString.parseLiteral(ast)
        validateCeramicString(fieldName, args, value)
        return value
      }
    })
  }
}

function validateCeramicString(
  fieldName: string,
  args: Record<string, any>,
  value: string) {
  if (args && args.min && value.length < args.min) {
    throw new Error(`${fieldName} Must be at least ${args.min} characters in length`)
  }
  if (args && args.max && value.length > args.max) {
    throw new Error(`${fieldName} Must be shorter than ${args.max} characters in length`)
  }
}
