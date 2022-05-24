import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils'
import { GraphQLSchema, GraphQLObjectType, GraphQLFieldConfig, GraphQLList, GraphQLString } from 'graphql'

const MODEL_DIRECTIVE_NAME = 'model'
const ARRAY_LENGTH_DIRECTIVE_NAME = 'arrayLength'
const LENGTH_DIRECTIVE_NAME = 'length'
const INT_RANGE_DIRECTIVE_NAME = 'intRange'
const FLOAT_RANGE_DIRECTIVE_NAME = 'floatRange'

const RANGE_DIRECTIVES = [INT_RANGE_DIRECTIVE_NAME, FLOAT_RANGE_DIRECTIVE_NAME]

export type ModelDirective = {
  accountRelation: string
  description: string
}

export type LengthDirective = {
  min?: number
  max: number
}

export type RangeDirective = {
  min?: number
  max?: number
}

export type CeramicGraphQLTypeExtension = {
  ceramicDirectiveName: string
  accountRelation?: string
  modelDescription?: string
  min?: number
  max?: number
}

export type CeramicGraphQLTypeExtensions = {
  [ceramicDirectiveName: string]: CeramicGraphQLTypeExtension
}

export function getCeramicModelDirective(
  schema: GraphQLSchema, 
  objectConfig: GraphQLObjectType<any, any>
): ModelDirective | undefined {
  return getDirective(
    schema,
    objectConfig,
    MODEL_DIRECTIVE_NAME
  )?.[0] as ModelDirective
}

function objectConfigMapperFactory(
  schema: GraphQLSchema
): (objectConfig: GraphQLObjectType<any, any>) => GraphQLObjectType<any, any> {
  function objectConfigMapper(
    objectConfig: GraphQLObjectType<any, any>
  ): GraphQLObjectType<any, any> {
    const modelDirective = getCeramicModelDirective(schema, objectConfig)
    if (modelDirective) {
      objectConfig.extensions = {
        ...objectConfig.extensions,
        ceramicExtensions: [
          {
            ceramicDirectiveName: MODEL_DIRECTIVE_NAME,
            accountRelation: modelDirective.accountRelation,
            modelDescription: modelDirective.description,
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
    let ceramicExtensions: CeramicGraphQLTypeExtensions = {}

    // TODO: Add valication to check, if custom directive are applied to the right field types?
    // E.g. @arrayLength should only work for arrays, etc.
    const arrayLengthDirective = getDirective(
      schema,
      fieldConfig,
      ARRAY_LENGTH_DIRECTIVE_NAME
    )?.[0] as LengthDirective
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
    const lengthDirective = getDirective(
      schema,
      fieldConfig,
      LENGTH_DIRECTIVE_NAME
    )?.[0] as LengthDirective
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

    RANGE_DIRECTIVES.forEach((valueDirectiveName) => {
      const valueDirective = getDirective(
        schema,
        fieldConfig,
        valueDirectiveName
      )?.[0] as RangeDirective
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
