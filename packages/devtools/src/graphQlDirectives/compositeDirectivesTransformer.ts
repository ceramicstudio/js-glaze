import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils'
import { GraphQLSchema, GraphQLObjectType, GraphQLFieldConfig } from 'graphql'

const ARRAY_LENGTH_DIRECTIVE_NAME = 'arrayLength'
const LENGTH_DIRECTIVE_NAME = 'length'
const INT_RANGE_DIRECTIVE_NAME = 'intRange'
const FLOAT_RANGE_DIRECTIVE_NAME = 'floatRange'

function objectConfigMapperFactory(
  schema: GraphQLSchema
): (objectConfig: GraphQLObjectType<any, any>) => GraphQLObjectType<any, any> {
  function objectConfigMapper(
    objectConfig: GraphQLObjectType<any, any>
  ): GraphQLObjectType<any, any> {
    const modelDirective = getDirective(schema, objectConfig, 'model')?.[0]
    if (modelDirective) {
      objectConfig.extensions = {
        ...objectConfig.extensions,
        ceramicExtensions: [
          {
            ceramicDirectiveName: 'model',
            accountRelation: modelDirective['accountRelation'].toLowerCase(),
            modelDescription: modelDirective['description'],
          },
        ],
      }
    }
    return objectConfig
  }
  return objectConfigMapper
}

function fieldConfigMapperFactory(
  schema: GraphQLSchema
): (fieldConfig: GraphQLFieldConfig<any, any, any>) => GraphQLFieldConfig<any, any, any> {
  function fieldConfigMapper(
    fieldConfig: GraphQLFieldConfig<any, any, any>
  ): GraphQLFieldConfig<any, any, any> {
    let ceramicExtensions: Record<string, any> = {}

    // TODO: Add valication to check, if custom directive are applied to the right field types?
    // E.g. @arrayLength should only work for arrays, etc.
    const arrayLengthDirective = getDirective(schema, fieldConfig, ARRAY_LENGTH_DIRECTIVE_NAME)?.[0]
    if (arrayLengthDirective) {
      ceramicExtensions = {
        ...ceramicExtensions,
        [ARRAY_LENGTH_DIRECTIVE_NAME]: {
          ceramicDirectiveName: ARRAY_LENGTH_DIRECTIVE_NAME,
          min: arrayLengthDirective.min || undefined,
          max: arrayLengthDirective.max || undefined,
        },
      }
    }

    // TODO: This needs to work differently for srings and for arrays of strings
    const lengthDirective = getDirective(schema, fieldConfig, LENGTH_DIRECTIVE_NAME)?.[0]
    if (lengthDirective) {
      ceramicExtensions = {
        ...ceramicExtensions,
        [LENGTH_DIRECTIVE_NAME]: {
          ceramicDirectiveName: LENGTH_DIRECTIVE_NAME,
          min: lengthDirective.min || undefined,
          max: lengthDirective.max || undefined,
        },
      }
    }

    [INT_RANGE_DIRECTIVE_NAME, FLOAT_RANGE_DIRECTIVE_NAME].forEach((valueDirectiveName) => {
      const valueDirective = getDirective(schema, fieldConfig, valueDirectiveName)?.[0]
      if (valueDirective) {
        ceramicExtensions = {
          ...ceramicExtensions,
          [valueDirectiveName]: {
            ceramicDirectiveName: valueDirectiveName,
            min: valueDirective.min || undefined,
            max: valueDirective.max || undefined,
          },
        }
      }
    })

    if (Object.keys(ceramicExtensions).length > 0) {
      fieldConfig.extensions = {
        ...fieldConfig.extensions,
        ceramicExtensions: ceramicExtensions,
      }
    }
    return fieldConfig
  }
  return fieldConfigMapper
}

export function compositeDirectivesTransformer(schema: GraphQLSchema): GraphQLSchema {
  return mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: objectConfigMapperFactory(schema),
    [MapperKind.OBJECT_FIELD]: fieldConfigMapperFactory(schema),
  })
}
