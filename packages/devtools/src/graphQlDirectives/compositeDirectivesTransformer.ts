import type { ModelAccountRelation, ModelViewDefinition } from '@ceramicnetwork/stream-model'
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
import { GraphQLDID } from 'graphql-scalars'

import { CeramicCommitID } from './commitid.scalar.js'

const MODEL_DIRECTIVE_NAME = 'model'
const DOCUMENT_ACCOUNT_DIRECTIVE_NAME = 'documentAccount'
const DOCUMENT_VERSION_DIRECTIVE_NAME = 'documentVersion'
const ARRAY_LENGTH_DIRECTIVE_NAME = 'arrayLength'
const LENGTH_DIRECTIVE_NAME = 'length'
const INT_RANGE_DIRECTIVE_NAME = 'intRange'
const FLOAT_RANGE_DIRECTIVE_NAME = 'floatRange'

const VIEW_DIRECTIVE_NAMES = [DOCUMENT_ACCOUNT_DIRECTIVE_NAME, DOCUMENT_VERSION_DIRECTIVE_NAME]

export type ModelDirective = {
  accountRelation: ModelAccountRelation
  description: string
}

export type ViewDirective = ModelViewDefinition

export type DirectiveWithoutParams = ViewDirective

export type LengthDirective = {
  min?: number
  max: number
}

export type RangeDirective = {
  min?: number
  max?: number
}

export type CeramicGraphQLTypeExtensions = {
  [MODEL_DIRECTIVE_NAME]?: ModelDirective
  [ARRAY_LENGTH_DIRECTIVE_NAME]?: LengthDirective
  [LENGTH_DIRECTIVE_NAME]?: LengthDirective
  [INT_RANGE_DIRECTIVE_NAME]?: RangeDirective
  [FLOAT_RANGE_DIRECTIVE_NAME]?: RangeDirective
  view?: ViewDirective
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
function parseDirectiveWithoutParams(
  directiveName: string,
  allowedType: GraphQLType,
  schema: GraphQLSchema,
  fieldConfig: GraphQLFieldConfig<any, any, any>,
  ceramicExtensions: CeramicGraphQLTypeExtensions
): CeramicGraphQLTypeExtensions {
  const directive = getDirective(schema, fieldConfig, directiveName)?.[0] as DirectiveWithoutParams
  if (directive) {
    if (!fieldTypeIsinstanceOfOrWraps(fieldConfig.type, allowedType)) {
      throw new Error(`@${directiveName} can only be applied to ${allowedType.toString()}s`)
    }

    if (VIEW_DIRECTIVE_NAMES.includes(directiveName)) {
      ceramicExtensions = {
        ...ceramicExtensions,
        view: { type: directiveName } as ViewDirective,
      }
    } else {
      ceramicExtensions = {
        ...ceramicExtensions,
        [directiveName]: { type: directiveName },
      }
    }
  }
  return ceramicExtensions
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
        min: lengthDirective.min,
        max: lengthDirective.max,
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
        min: arrayLengthDirective.min,
        max: arrayLengthDirective.max,
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
        min: intRangeDirective.min,
        max: intRangeDirective.max,
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
        min: floatRangeDirective.min,
        max: floatRangeDirective.max,
      },
    }
  }
  return ceramicExtensions
}

function validateRequiredDirectivesForFields(
  fieldConfig: GraphQLFieldConfig<any, any, any>,
  ceramicExtensions: CeramicGraphQLTypeExtensions
) {
  if (
    fieldTypeIsinstanceOfOrWraps(fieldConfig.type, GraphQLString) ||
    fieldTypeIsInstanceOfOrWrapsArray(fieldConfig.type, GraphQLString)
  ) {
    if (!Object.keys(ceramicExtensions).includes(LENGTH_DIRECTIVE_NAME)) {
      throw new Error(`Missing @${LENGTH_DIRECTIVE_NAME} directive`)
    }
  }

  if (
    fieldConfig.type instanceof GraphQLList ||
    (fieldConfig.type instanceof GraphQLNonNull && fieldConfig.type.ofType instanceof GraphQLList)
  ) {
    if (!Object.keys(ceramicExtensions).includes(ARRAY_LENGTH_DIRECTIVE_NAME)) {
      throw new Error(`Missing @${ARRAY_LENGTH_DIRECTIVE_NAME} directive`)
    }
  }
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
    ceramicExtensions = parseDirectiveWithoutParams(
      DOCUMENT_ACCOUNT_DIRECTIVE_NAME,
      GraphQLDID,
      schema,
      fieldConfig,
      ceramicExtensions
    )
    ceramicExtensions = parseDirectiveWithoutParams(
      DOCUMENT_VERSION_DIRECTIVE_NAME,
      CeramicCommitID,
      schema,
      fieldConfig,
      ceramicExtensions
    )
    ceramicExtensions = parseArrayLengthDirective(schema, fieldConfig, ceramicExtensions)
    ceramicExtensions = parseLengthDirective(schema, fieldConfig, ceramicExtensions)
    ceramicExtensions = parseIntRangeDirective(schema, fieldConfig, ceramicExtensions)
    ceramicExtensions = parseFloatRangeDirective(schema, fieldConfig, ceramicExtensions)

    // Check that certain field types have directives required for them
    validateRequiredDirectivesForFields(fieldConfig, ceramicExtensions)

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
