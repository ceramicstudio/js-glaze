import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils'
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLFieldConfig,
  GraphQLList,
  GraphQLString,
  GraphQLOutputType,
  GraphQLType,
  GraphQLScalarType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
} from 'graphql'

const MODEL_DIRECTIVE_NAME = 'model'
const ARRAY_LENGTH_DIRECTIVE_NAME = 'arrayLength'
const LENGTH_DIRECTIVE_NAME = 'length'
const INT_RANGE_DIRECTIVE_NAME = 'intRange'
const FLOAT_RANGE_DIRECTIVE_NAME = 'floatRange'

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

/** @internal */
export function getCeramicModelDirective(
  schema: GraphQLSchema,
  objectConfig: GraphQLObjectType<any, any>
): ModelDirective | undefined {
  return getDirective(schema, objectConfig, MODEL_DIRECTIVE_NAME)?.[0] as ModelDirective
}

/** @internal */
export function fieldTypeIsinstanceOfOrWraps(
  fieldType: GraphQLOutputType,
  type: GraphQLType
): fieldType is GraphQLScalarType {
  return (
    (fieldType instanceof GraphQLScalarType &&
      fieldType.name.toLowerCase() === type.toString().toLowerCase()) ||
    (fieldType instanceof GraphQLNonNull &&
      fieldType.ofType.toString().toLowerCase() === type.toString().toLowerCase())
  )
}

/** @internal */
function fieldTypeIsInstanceOfOrWrapsArray(
  fieldType: GraphQLOutputType,
  itemType?: GraphQLType
): fieldType is GraphQLList<GraphQLScalarType | GraphQLObjectType> {
  if (itemType !== undefined) {
    return (
      (fieldType instanceof GraphQLList &&
        fieldType.ofType.toString().toLowerCase() === itemType.toString().toLowerCase()) ||
      (fieldType instanceof GraphQLNonNull &&
        fieldType.ofType instanceof GraphQLList &&
        fieldType.ofType.ofType.toString().toLowerCase() === itemType.toString().toLowerCase())
    )
  } else {
    return (
      fieldType instanceof GraphQLList ||
      (fieldType instanceof GraphQLNonNull && fieldType.ofType instanceof GraphQLList)
    )
  }
}

/** @internal */
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

/** @internal */
function parseLengthDirective(
  schema: GraphQLSchema,
  fieldConfig: GraphQLFieldConfig<any, any, any>,
  ceramicExtensions: CeramicGraphQLTypeExtensions
): CeramicGraphQLTypeExtensions {
  const lengthDirective = getDirective(
    schema,
    fieldConfig,
    LENGTH_DIRECTIVE_NAME
  )?.[0] as LengthDirective
  if (lengthDirective) {
    if (
      !fieldTypeIsinstanceOfOrWraps(fieldConfig.type, GraphQLString) &&
      !fieldTypeIsInstanceOfOrWrapsArray(fieldConfig.type, GraphQLString)
    ) {
      throw new Error(
        `@${LENGTH_DIRECTIVE_NAME} can only be applied to strings or arrays of strings`
      )
    }

    ceramicExtensions = {
      ...ceramicExtensions,
      [LENGTH_DIRECTIVE_NAME]: {
        ceramicDirectiveName: LENGTH_DIRECTIVE_NAME,
        min: lengthDirective.min || undefined,
        max: lengthDirective.max || undefined,
      },
    }
  }
  return ceramicExtensions
}

/** @internal */
function parseArrayLengthDirective(
  schema: GraphQLSchema,
  fieldConfig: GraphQLFieldConfig<any, any, any>,
  ceramicExtensions: CeramicGraphQLTypeExtensions
): CeramicGraphQLTypeExtensions {
  const arrayLengthDirective = getDirective(
    schema,
    fieldConfig,
    ARRAY_LENGTH_DIRECTIVE_NAME
  )?.[0] as LengthDirective
  if (arrayLengthDirective) {
    if (!fieldTypeIsInstanceOfOrWrapsArray(fieldConfig.type)) {
      throw new Error(`@${ARRAY_LENGTH_DIRECTIVE_NAME} can only be applied to arrays`)
    }

    ceramicExtensions = {
      ...ceramicExtensions,
      [ARRAY_LENGTH_DIRECTIVE_NAME]: {
        ceramicDirectiveName: ARRAY_LENGTH_DIRECTIVE_NAME,
        min: arrayLengthDirective.min || undefined,
        max: arrayLengthDirective.max || undefined,
      },
    }
  }
  return ceramicExtensions
}

/** @internal */
function parseIntRangeDirective(
  schema: GraphQLSchema,
  fieldConfig: GraphQLFieldConfig<any, any, any>,
  ceramicExtensions: CeramicGraphQLTypeExtensions
): CeramicGraphQLTypeExtensions {
  const intRangeDirective = getDirective(
    schema,
    fieldConfig,
    INT_RANGE_DIRECTIVE_NAME
  )?.[0] as RangeDirective
  if (intRangeDirective) {
    if (
      !fieldTypeIsinstanceOfOrWraps(fieldConfig.type, GraphQLInt) &&
      !fieldTypeIsInstanceOfOrWrapsArray(fieldConfig.type, GraphQLInt)
    ) {
      throw new Error(
        `@${INT_RANGE_DIRECTIVE_NAME} can only be applied to integers or arrays of integers`
      )
    }

    ceramicExtensions = {
      ...ceramicExtensions,
      [INT_RANGE_DIRECTIVE_NAME]: {
        ceramicDirectiveName: INT_RANGE_DIRECTIVE_NAME,
        min: intRangeDirective.min || undefined,
        max: intRangeDirective.max || undefined,
      },
    }
  }
  return ceramicExtensions
}

/** @internal */
function parseFloatRangeDirective(
  schema: GraphQLSchema,
  fieldConfig: GraphQLFieldConfig<any, any, any>,
  ceramicExtensions: CeramicGraphQLTypeExtensions
): CeramicGraphQLTypeExtensions {
  const floatRangeDirective = getDirective(
    schema,
    fieldConfig,
    FLOAT_RANGE_DIRECTIVE_NAME
  )?.[0] as RangeDirective
  if (floatRangeDirective) {
    if (
      !fieldTypeIsinstanceOfOrWraps(fieldConfig.type, GraphQLFloat) &&
      !fieldTypeIsInstanceOfOrWrapsArray(fieldConfig.type, GraphQLFloat)
    ) {
      throw new Error(
        `@${FLOAT_RANGE_DIRECTIVE_NAME} can only be applied to floats or arrays of floats`
      )
    }

    ceramicExtensions = {
      ...ceramicExtensions,
      [FLOAT_RANGE_DIRECTIVE_NAME]: {
        ceramicDirectiveName: FLOAT_RANGE_DIRECTIVE_NAME,
        min: floatRangeDirective.min || undefined,
        max: floatRangeDirective.max || undefined,
      },
    }
  }
  return ceramicExtensions
}

/** @internal */
function fieldConfigMapperFactory(
  schema: GraphQLSchema
): (fieldConfig: GraphQLFieldConfig<any, any, any>) => GraphQLFieldConfig<any, any, any> {
  function fieldConfigMapper(
    fieldConfig: GraphQLFieldConfig<any, any, any>
  ): GraphQLFieldConfig<any, any, any> {
    let ceramicExtensions: CeramicGraphQLTypeExtensions = {}

    // Parse and validate custom directives
    ceramicExtensions = parseArrayLengthDirective(schema, fieldConfig, ceramicExtensions)
    ceramicExtensions = parseLengthDirective(schema, fieldConfig, ceramicExtensions)
    ceramicExtensions = parseIntRangeDirective(schema, fieldConfig, ceramicExtensions)
    ceramicExtensions = parseFloatRangeDirective(schema, fieldConfig, ceramicExtensions)

    // Update field config with custom values from ceramicExtensions,
    // so that they can be processed later, e.g. converted to JSON Schema
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

/** @internal */
export function compositeDirectivesTransformer(schema: GraphQLSchema): GraphQLSchema {
  return mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: objectConfigMapperFactory(schema),
    [MapperKind.OBJECT_FIELD]: fieldConfigMapperFactory(schema),
  })
}
