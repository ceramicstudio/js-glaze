import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql'
import { mapSchema, MapperKind } from '@graphql-tools/utils'
import { makeExecutableSchema } from '@graphql-tools/schema'
import {
  compositeDirectivesTransformer,
  fieldTypeIsinstanceOfOrWraps,
  getCeramicModelDirective,
} from './graphQlDirectives/compositeDirectivesTransformer.js'
import type { CeramicGraphQLTypeExtensions } from './graphQlDirectives/compositeDirectivesTransformer.js'
import type { ModelDirective } from './graphQlDirectives/compositeDirectivesTransformer.js'
import type { JSONSchema, ModelAccountRelation, ModelDefinition } from '@glazed/types'
import { compositeDirectivesAndScalarsSchema } from './graphQlDirectives/compositeDirectivesAndScalars.schema.js'
import { GraphQLDID } from 'graphql-scalars'
import { GraphQLStreamReference } from './graphQlDirectives/streamReference.scalar.js'

export type ModelsWithEmbeds = {
  models: Array<ModelDefinition>
  commonEmbeds?: Array<string>
}

/** @internal */
export function compositeModelsAndCommonEmbedsFromGraphQLSchema(
  schema: string | GraphQLSchema
): ModelsWithEmbeds {
  if (typeof schema === 'string') {
    schema = makeExecutableSchema({
      typeDefs: [compositeDirectivesAndScalarsSchema, schema],
    })
  }

  // Throw an error, if there are any unsupported types in the schema
  checkForUnsupportedTypes(schema)
  // Parse and validate custom ceramic graphQL directives, throw an error if validation fails
  const compositeSchema = compositeDirectivesTransformer(schema)
  // Extract embedded definitions from the schema
  const definitions = embeddedObjectsDefinitionsFromGraphQLSchema(compositeSchema)
  // Extract the models in JSONSchema format (including $defs copied from definitions)
  const models = modelsFromGraphQLSchema(compositeSchema, definitions)
  // Extract names of embeds (definitions) used in more than one model
  const commonEmbeds = commonEmbedNamesFromModels(models)

  const result: ModelsWithEmbeds = {
    models: models,
  }

  if (commonEmbeds.length > 0) {
    result.commonEmbeds = commonEmbeds
  }

  return result
}

/** @internal */
function checkForUnsupportedTypes(schema: GraphQLSchema) {
  mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (objectConfig: GraphQLObjectType) => {
      if (objectConfig.getInterfaces().length > 0) {
        throw new Error('GraphQL interfaces are not supported')
      }
      for (const fieldDefinition of Object.values(objectConfig.getFields())) {
        if (fieldDefinition.type instanceof GraphQLUnionType) {
          throw new Error('GraphQL unions are not supported')
        }
      }
      return objectConfig
    },
  })
}

/** @internal */
function commonEmbedNamesFromModels(models: Array<ModelDefinition>): Array<string> {
  const definitionOccurences: { [embedName: string]: number } = {}
  models.forEach((modelDefinition: ModelDefinition) => {
    Object.keys(modelDefinition.schema.$defs || {}).forEach((embedName: string) => {
      if (definitionOccurences[embedName] === undefined) {
        definitionOccurences[embedName] = 0
      }
      definitionOccurences[embedName] += 1
    })
  })

  const commonEmbeds: Array<string> = []
  Object.keys(definitionOccurences).forEach((embedName: string) => {
    if (definitionOccurences[embedName] > 1) {
      commonEmbeds.push(embedName)
    }
  })

  return commonEmbeds
}

/** @internal */
function embeddedObjectsDefinitionsFromGraphQLSchema(
  schema: GraphQLSchema
): Record<string, JSONSchema.Object> {
  const definitions: Record<string, JSONSchema.Object> = {}
  mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (objectConfig: GraphQLObjectType) => {
      const modelDirective = getCeramicModelDirective(schema, objectConfig)
      if (!modelDirective) {
        definitions[objectConfig.name] = embeddedObjectDefinitionFromObjectConfig(objectConfig)
      }
      return objectConfig
    },
  })
  return definitions
}

/** @internal */
function modelsFromGraphQLSchema(
  schema: GraphQLSchema,
  definitions: Record<string, JSONSchema.Object>
): Array<ModelDefinition> {
  const models: Array<ModelDefinition> = []
  mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (objectConfig: GraphQLObjectType) => {
      const modelDirective = getCeramicModelDirective(schema, objectConfig)
      if (modelDirective) {
        models.push(modelFromObjectConfig(modelDirective, objectConfig, definitions))
      }
      return objectConfig
    },
  })

  if (Object.keys(models).length === 0) {
    throw new Error('No models found in Composite Definition Schema')
  }

  return models
}

/** @internal */
function embeddedObjectDefinitionFromObjectConfig(
  objectConfig: GraphQLObjectType
): JSONSchema.Object {
  const properties: Record<string, JSONSchema> = {}
  const required: Array<string> = []
  for (const [fieldName, fieldDefinition] of Object.entries(objectConfig.getFields())) {
    properties[fieldName] = fieldSchemaFromFieldDefinition(
      fieldDefinition.name,
      fieldDefinition.type,
      fieldDefinition.extensions?.ceramicExtensions as CeramicGraphQLTypeExtensions
    )
    if (fieldDefinition.type instanceof GraphQLNonNull) {
      required.push(fieldName)
    }
  }

  const schema: JSONSchema.Object = {
    type: 'object',
    title: objectConfig.name,
    properties: properties,
    additionalProperties: false,
  }

  if (required.length > 0) {
    schema.required = required
  }

  return schema
}

/** @internal */
function modelFromObjectConfig(
  modelDirective: ModelDirective,
  objectConfig: GraphQLObjectType,
  allDefinitions: Record<string, JSONSchema.Object>
): ModelDefinition {
  const modelSchema: JSONSchema.Object = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    additionalProperties: false,
  }
  const modelSchemaProperties: Record<string, JSONSchema> = {}
  const requiredProperties: Array<string> = []
  const definitionsUsedInTheModel: Record<string, JSONSchema.Object> = {}

  for (const [fieldName, fieldDefinition] of Object.entries(objectConfig.getFields())) {
    modelSchemaProperties[fieldName] = fieldSchemaFromFieldDefinition(
      fieldDefinition.name,
      fieldDefinition.type,
      fieldDefinition.extensions?.ceramicExtensions as CeramicGraphQLTypeExtensions
    )
    if (fieldDefinition.type instanceof GraphQLNonNull) {
      requiredProperties.push(fieldName)
    }

    const typeName =
      (fieldDefinition.type instanceof GraphQLList && fieldDefinition.type.ofType.toString()) ||
      (fieldDefinition.type instanceof GraphQLNonNull && fieldDefinition.type.ofType.toString()) ||
      fieldDefinition.type.toString()
    if (Object.keys(allDefinitions).includes(typeName)) {
      definitionsUsedInTheModel[typeName] = allDefinitions[typeName]
    }
  }
  /**
   * Some definitions in definitionsUsedInTheModel may have refs to other definitions
   * and we need to make sure that definitionUsedInModel contain them too.
   *
   * Example:
   * type ImageMetadata {
   *   src: String! @length(max: 150)
   * }
   *
   * type ImageSources {
   *   original: ImageMetadata!
   *   alternatives: [ImageMetadata]
   * }
   *
   * In this case, we need to make sure that definitionsUsedInTheModel also contain the definition of ImageMetadata.
   *
   * To do this, we create a helper list var caller definitionsUsedInTheDefinitions and add
   * to this list all the definitions from definitionsUsedInTheModel that are referred to by other definitions
   *
   * The final model definitions is gonna be the merge of definitionsUsedInTheModel and definitionsUsedInTheDefinitions
   */
  const definitionsUsedInTheDefinitions: Record<string, JSONSchema.Object> = {}
  Object.values(definitionsUsedInTheModel).forEach((definitionUsedInModel) => {
    if (definitionUsedInModel.properties) {
      Object.values(definitionUsedInModel.properties).forEach((propertyDefinition) => {
        const objectPropertyDefinition = propertyDefinition as JSONSchema.Object
        if (objectPropertyDefinition.$ref) {
          const nestedObjectName = objectPropertyDefinition.$ref.split('#/$defs/')[1]
          definitionsUsedInTheDefinitions[nestedObjectName] = allDefinitions[nestedObjectName]
        }
      })
    }
  })

  modelSchema.properties = modelSchemaProperties
  modelSchema.$defs = { ...definitionsUsedInTheModel, ...definitionsUsedInTheDefinitions }
  if (Object.keys(modelSchema.$defs).length === 0) {
    delete modelSchema.$defs
  }

  if (requiredProperties.length > 0) {
    modelSchema.required = requiredProperties
  }

  return {
    name: objectConfig.name,
    accountRelation: modelDirective.accountRelation.toLowerCase() as ModelAccountRelation,
    description: modelDirective.description,
    schema: modelSchema,
  }
}

/** @internal */
function fieldSchemaFromFieldDefinition(
  fieldName: string,
  fieldType: GraphQLOutputType,
  ceramicExtensions?: CeramicGraphQLTypeExtensions
): JSONSchema {
  if (fieldType instanceof GraphQLObjectType) {
    const objectSchema = referenceFieldSchemaFromFieldDefinition(fieldType)
    if (!objectSchema) {
      throw new Error('Unexpected error when parsing an object definition')
    }
    return objectSchema
  }
  if (fieldType instanceof GraphQLNonNull && fieldType.ofType instanceof GraphQLObjectType) {
    const objectSchema = referenceFieldSchemaFromFieldDefinition(fieldType.ofType)
    if (!objectSchema) {
      throw new Error('Unexpected error when parsing an object definition')
    }
    return objectSchema
  }
  if (fieldType instanceof GraphQLList) {
    const arraySchema = arrayFieldSchemaFromFieldDefinition(fieldName, fieldType, ceramicExtensions)
    if (!arraySchema) {
      throw new Error('Unexpected error when parsing a list definition')
    }
    return arraySchema
  }
  if (fieldType instanceof GraphQLNonNull && fieldType.ofType instanceof GraphQLList) {
    const arraySchema = arrayFieldSchemaFromFieldDefinition(
      fieldName,
      fieldType.ofType,
      ceramicExtensions
    )
    if (!arraySchema) {
      throw new Error('Unexpected error when parsing a list definition')
    }
    return arraySchema
  }

  return defaultFieldSchemaFromFieldDefinition(fieldType, ceramicExtensions)
}

/** @internal */
function referenceFieldSchemaFromFieldDefinition(
  fieldType: GraphQLOutputType
): JSONSchema | undefined {
  if (!(fieldType instanceof GraphQLObjectType)) {
    return
  }
  return {
    $ref: `#/$defs/${fieldType.name}`,
  }
}

/** @internal */
function arrayFieldSchemaFromFieldDefinition(
  fieldName: string,
  fieldType: GraphQLOutputType,
  ceramicExtensions?: CeramicGraphQLTypeExtensions
): JSONSchema.Array | undefined {
  if (!(fieldType instanceof GraphQLList)) {
    return
  }

  const result: JSONSchema.Array = {
    type: 'array',
    items: fieldSchemaFromFieldDefinition(
      fieldName,
      fieldType.ofType,
      ceramicExtensions // ceramicExtensions are applied recursively to array items
    ),
  }

  if (ceramicExtensions) {
    if (ceramicExtensions.arrayLength !== undefined) {
      if (ceramicExtensions.arrayLength.min) {
        result.minItems = ceramicExtensions.arrayLength.min
      }
      if (ceramicExtensions.arrayLength.max) {
        result.maxItems = ceramicExtensions.arrayLength.max
      }
    }
  }
  return result
}

/** @internal */
function defaultFieldSchemaFromFieldDefinition(
  fieldType: GraphQLOutputType,
  ceramicExtensions?: CeramicGraphQLTypeExtensions
): JSONSchema {
  let result: JSONSchema = {
    type: fieldType.toString().toLowerCase(),
  }

  if (fieldTypeIsinstanceOfOrWraps(fieldType, GraphQLDID)) {
    result = {
      ...result,
      type: 'string',
      title: 'GraphQLDID',
      pattern: "/^did:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/",
      maxLength: 80,
    }
  }

  if (fieldTypeIsinstanceOfOrWraps(fieldType, GraphQLStreamReference)) {
    result = {
      ...result,
      type: 'string',
      title: 'CeramicStreamReference',
      pattern: '<TBD>', //FIXME: define the pattern for StreamReference strings
      maxLength: 80,
    }
  }

  if (fieldTypeIsinstanceOfOrWraps(fieldType, GraphQLID)) {
    result = {
      ...result,
      type: 'string',
      title: 'GraphQLID',
    }
  }

  if (fieldTypeIsinstanceOfOrWraps(fieldType, GraphQLInt)) {
    result = {
      ...result,
      type: 'integer',
    }
  }

  if (fieldTypeIsinstanceOfOrWraps(fieldType, GraphQLFloat)) {
    result = {
      ...result,
      type: 'number',
    }
  }

  if (fieldTypeIsinstanceOfOrWraps(fieldType, GraphQLBoolean)) {
    result = {
      ...result,
      type: 'boolean',
    }
  }

  if (fieldTypeIsinstanceOfOrWraps(fieldType, GraphQLString)) {
    result = {
      ...result,
      type: 'string',
    }
  }

  if (ceramicExtensions) {
    if (ceramicExtensions.length !== undefined) {
      if (ceramicExtensions.length.max !== undefined) {
        result.maxLength = ceramicExtensions.length.max
      }
      if (ceramicExtensions.length.min !== undefined) {
        result.minLength = ceramicExtensions.length.min
      }
    }

    if (ceramicExtensions.intRange !== undefined) {
      if (ceramicExtensions.intRange.max !== undefined) {
        result.maximum = ceramicExtensions.intRange.max
      }
      if (ceramicExtensions.intRange.min !== undefined) {
        result.minimum = ceramicExtensions.intRange.min
      }
    }

    if (ceramicExtensions.floatRange !== undefined) {
      if (ceramicExtensions.floatRange.max !== undefined) {
        result.maximum = ceramicExtensions.floatRange.max
      }
      if (ceramicExtensions.floatRange.min !== undefined) {
        result.minimum = ceramicExtensions.floatRange.min
      }
    }
  }
  return result
}
