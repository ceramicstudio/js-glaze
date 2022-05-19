import type { StreamRef } from '@ceramicnetwork/streamid'
import 'util'
import { 
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLSchema 
} from 'graphql';
import {
  mapSchema,
  getDirective,
  MapperKind 
} from '@graphql-tools/utils';
import { makeExecutableSchema } from "@graphql-tools/schema";
import { compositeDirectivesTransformer } from './graphQlDirectives/compositeDirectivesTransformer';
import { InternalCompositeDefinition, ModelDefinition } from '@glazed/types';
import { compositeDirectivesAndScalarsSchema } from './graphQlDirectives/compositeDirectivesAndScalars.schema';
import { Composite } from './composite';

/** @internal */
export function streamIDToString(id: StreamRef | string): string {
  return typeof id === 'string' ? id : id.toString()
}

/** @internal */
export function applyMap<
  M extends Record<string, unknown>,
  V extends M[keyof M] = M[keyof M],
  R = unknown
>(inputs: M, callFunc: (input: V) => R): Record<keyof M, R> {
  return Object.entries(inputs).reduce((acc, [key, value]) => {
    acc[key as keyof M] = callFunc(value as V)
    return acc
  }, {} as Record<keyof M, R>)
}

/** @internal */
export async function promiseMap<
  M extends Record<string, unknown>,
  V extends M[keyof M] = M[keyof M],
  R = unknown
>(inputs: M, callFunc: (input: V) => Promise<R>): Promise<Record<keyof M, R>> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const results = await Promise.all(Object.values(inputs).map((value) => callFunc(value as any)))
  return Object.keys(inputs).reduce((acc, key, i) => {
    acc[key as keyof M] = results[i]
    return acc
  }, {} as Record<keyof M, R>)
}

/** @internal */
export function internalCompositeDefinitionFromGraphQLSchema(
  schema: string | GraphQLSchema
): InternalCompositeDefinition {
  if (typeof schema === 'string') {
    schema =  makeExecutableSchema({typeDefs: [compositeDirectivesAndScalarsSchema, schema]})
  }

  const compositeSchema = compositeDirectivesTransformer(schema)
  const definitions = embeddedObjectsDefinitionsFromGraphQLSchema(compositeSchema)
  const models = modelsFromGraphQLSchema(compositeSchema, definitions)
  const commonEmbeds = commonEmbedNamesFromModels(models)
  fixArrayItemsConstraints(models)

  const result: InternalCompositeDefinition = {
    version: Composite.VERSION,
    models: models
  }

  if (commonEmbeds.length > 0) {
    result.commonEmbeds = commonEmbeds
  }

  return result
}

/** @internal */
function fixArrayItemsConstraints(models: Record<string, ModelDefinition>) {
  function rewriteArrayRecord(arrayRecord: Record<string, any>) {
    if (arrayRecord.minItemLength !== undefined) {
      arrayRecord.items.minLength = arrayRecord.minItemLength
      delete arrayRecord.minItemLength
    }
    if (arrayRecord.maxItemLength !== undefined) {
      arrayRecord.items.maxLength = arrayRecord.maxItemLength
      delete arrayRecord.maxItemLength
    }
  }

  Object.values(models).forEach((model: ModelDefinition) => {
    Object.values(model.schema.properties!).forEach((modelProperty) => {
      const propertyRecord = modelProperty as Record<string, any>
      if (propertyRecord.type === 'array') {
        rewriteArrayRecord(propertyRecord)
      }
    })

    if (model.schema.definitions) {
      Object.values(model.schema.definitions).forEach((definition) => {
        const definitionRecord = definition as Record<string, any>
        if (definitionRecord.type === 'array') {
          rewriteArrayRecord(definitionRecord)
        }
      })
    }
  })
}

/** @internal */
function commonEmbedNamesFromModels(
  models: Record<string, ModelDefinition>
): string[] {
  const definitionOccurences: { [embedName: string]: number } = {}
  Object.values(models).forEach((modelDefinition: ModelDefinition) => {
    Object.keys(modelDefinition.schema.definitions || {}).forEach((embedName: string) => {
      if(definitionOccurences[embedName] === undefined) {
        definitionOccurences[embedName] = 0
      }
      definitionOccurences[embedName] += 1
    })
  });

  const commonEmbeds: string[] = []
  Object.keys(definitionOccurences).forEach((embedName: string) => {
    if (definitionOccurences[embedName] > 1) {
      commonEmbeds.push(embedName)
    }
  })

  return commonEmbeds
}

/** @internal */
function embeddedObjectsDefinitionsFromGraphQLSchema(schema: GraphQLSchema): Record<string, any> {
  let definitions: Record<string, any> = {}
  mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (objectConfig: GraphQLObjectType) => {
      const modelDirective = getDirective(schema as GraphQLSchema, objectConfig, 'model')?.[0];
      if (!modelDirective) {
        definitions[objectConfig.name] = embeddedObjectDefinitionFromObjectConfig(objectConfig)
      } 
      return objectConfig;
    },
  })
  return definitions
}

/** @internal */
function modelsFromGraphQLSchema(
  schema: GraphQLSchema,
  definitions: Record<string, any>
): Record<string, ModelDefinition> {
  let models: Record<string, ModelDefinition> = {}
  mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (objectConfig: GraphQLObjectType) => {
      const modelDirective = getDirective(schema as GraphQLSchema, objectConfig, 'model')?.[0];
      if (modelDirective) {
        models[`${objectConfig.name}ID`] = modelFromObjectConfig(modelDirective, objectConfig, definitions)
      } 
      return objectConfig;
    },
  })

  if (Object.keys(models).length === 0) {
    throw new Error("No models found in Composite Definition Schema")
  }

  return models
}

/** @internal */
function embeddedObjectDefinitionFromObjectConfig(objectConfig: GraphQLObjectType): Record<string, any> {
  const properties:Record<string, any> = {}
  const required: string[] = []
  for (const [fieldName, fieldDefinition] of Object.entries(objectConfig.getFields())) {
    properties[fieldName] = fieldSchemaFromFieldDefinition(
      fieldDefinition.name,
      fieldDefinition.type,
      fieldDefinition.extensions?.ceramicExtensions as Record<string, any>
    )
    if (fieldDefinition.type instanceof GraphQLNonNull) {
      required.push(fieldName)
    }
  }

  return {
    type: 'object',
    title: objectConfig.name,
    properties: properties,
    required: required.length > 0 ? required : undefined
  }
}

/** @internal */
function modelFromObjectConfig(
  modelDirective: Record<string, any>, 
  objectConfig: GraphQLObjectType, 
  definitions: Record<string, any>
): ModelDefinition {
  const modelSchema: Record<string, any> = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object'
  }
  const modelSchemaProperties: Record<string, any> = {}
  const requiredProperties: string[] = []
  const requiredDefinitions: Record<string, any> = {}
  for (const [fieldName, fieldDefinition] of Object.entries(objectConfig.getFields())) {
    modelSchemaProperties[fieldName] = fieldSchemaFromFieldDefinition(
      fieldDefinition.name,
      fieldDefinition.type,
      fieldDefinition.extensions?.ceramicExtensions as Record<string, any>
    )
    if (fieldDefinition.type instanceof GraphQLNonNull) {
      requiredProperties.push(fieldName)
    }

    const typeName = (
      fieldDefinition.type instanceof GraphQLList && fieldDefinition.type.ofType.toString() ||
      fieldDefinition.type instanceof GraphQLNonNull && fieldDefinition.type.ofType.toString() ||
      fieldDefinition.type.toString()
    )
    if (Object.keys(definitions).includes(typeName)) {
      requiredDefinitions[typeName] = definitions[typeName]
    }
  }

  const nestedRequiredDefinitions: Record<string, any> = {}
  Object.keys(requiredDefinitions).forEach((fieldName: string) => {
    Object.keys(requiredDefinitions[fieldName].properties).forEach((propertyName: string) => {
      if (Object.keys(requiredDefinitions[fieldName].properties[propertyName]).includes("$ref")) {
        const nestedName = requiredDefinitions[fieldName].properties[propertyName].$ref.split("#/definitions/")[1]
        nestedRequiredDefinitions[nestedName] = definitions[nestedName]
      }
    })
  })

  modelSchema.properties = modelSchemaProperties
  modelSchema.definitions = {...requiredDefinitions, ...nestedRequiredDefinitions}
  if (Object.keys(modelSchema.definitions).length === 0) {
    delete modelSchema.definitions
  }
  modelSchema.required = requiredProperties.length > 0 ? requiredProperties : undefined

  return {
    name: objectConfig.name,
    accountRelation: modelDirective.index.toLowerCase(),
    description: modelDirective.description,
    schema: modelSchema
  }
}

/** @internal */
function fieldSchemaFromFieldDefinition(
  fieldName: string,
  fieldType: GraphQLOutputType,
  ceramicExtensions?: Record<string, any>
): Record<string, any> {
  if (fieldType instanceof GraphQLObjectType) {
    return referenceFieldSchemaFromFieldDefinition(fieldType) || {}
  }
  if (fieldType instanceof GraphQLNonNull && fieldType.ofType instanceof GraphQLObjectType) {
    return referenceFieldSchemaFromFieldDefinition(fieldType.ofType) || {}
  }
  if (fieldType instanceof GraphQLList) {
    return arrayFieldSchemaFromFieldDefinition(fieldName, fieldType, ceramicExtensions) || {}
  }
  return defaultFieldSchemaFromFieldDefinition(fieldType, ceramicExtensions)
}

/** @internal */
function referenceFieldSchemaFromFieldDefinition(
  fieldType: GraphQLOutputType,
): Record<string, any> | undefined {
  if (!(fieldType instanceof GraphQLObjectType)) {
    return 
  }
  return {
    $ref: `#/definitions/${fieldType.name}`
  }
}

/** @internal */
function arrayFieldSchemaFromFieldDefinition(
  fieldName: string,
  fieldType: GraphQLOutputType,
  ceramicExtensions?: Record<string, any>
): Record<string, any> | undefined {
  if (!(fieldType instanceof GraphQLList)) {
    return 
  }

  let result: Record<string, any> = {
    type: 'array',
    items: fieldSchemaFromFieldDefinition(fieldName, fieldType.ofType)
  }

  if (ceramicExtensions) {
    if (ceramicExtensions.length !== undefined) {
      if (ceramicExtensions.length.min) {
        result.minItems = ceramicExtensions.length.min
      }
      if (ceramicExtensions.length.max) {
        result.maxItems = ceramicExtensions.length.max
      }
    }
    if (ceramicExtensions.itemLength !== undefined) {
      if (ceramicExtensions.itemLength.min) {
        result.minItemLength = ceramicExtensions.itemLength.min
      }
      if (ceramicExtensions.itemLength.max) {
        result.maxItemLength = ceramicExtensions.itemLength.max
      }
    }
  } 
  return result
}

/** @internal */
function defaultFieldSchemaFromFieldDefinition(
  fieldType: GraphQLOutputType,
  ceramicExtensions?: Record<string, any>
): Record<string, any> {
  let result: Record<string, any> = {
    type: fieldType.toString().toLowerCase(),
  }

  if (
    fieldType instanceof GraphQLScalarType && fieldType.name.toLowerCase() === "DID".toLowerCase() ||
    fieldType instanceof GraphQLNonNull && fieldType.ofType.toString().toLowerCase() === "DID".toLowerCase()
  ) {
    result = {
      ...result, 
      type: 'string',
      title: 'DID',
      pattern: "/^did:[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+:[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+$/",
      maxLength: 80
    }
  }

  if (
    fieldType instanceof GraphQLScalarType && fieldType.name.toLowerCase() === "StreamReference".toLowerCase() ||
    fieldType instanceof GraphQLNonNull && fieldType.ofType.toString().toLowerCase() === "StreamReference".toLowerCase()
  ) {
    result = {
      ...result, 
      type: "string",
      title: "StreamReference",
      pattern: "<TBD>", //FIXME: define the pattern for StreamReference strings
      maxLength: 80
    }
  }

  if (
    fieldType instanceof GraphQLScalarType && fieldType.name.toLowerCase() === "ID".toLowerCase() ||
    fieldType instanceof GraphQLNonNull && fieldType.ofType.toString().toLowerCase() === "ID".toLowerCase()
  ) {
    result = {
      ...result, 
      type: 'string',
      title: 'GraphQLID'
    }
  }

  if (
    fieldType instanceof GraphQLScalarType && fieldType.name.toLowerCase() === "Int".toLowerCase() ||
    fieldType instanceof GraphQLNonNull && fieldType.ofType.toString().toLowerCase() === "Int".toLowerCase()
  ) {
    result = {
      ...result, 
      type: 'integer'
    }
  }

  if (
    fieldType instanceof GraphQLScalarType && fieldType.name.toLowerCase() === "Float".toLowerCase() ||
    fieldType instanceof GraphQLNonNull && fieldType.ofType.toString().toLowerCase() === "Float".toLowerCase()
  ) {
    result = {
      ...result, 
      type: 'number'
    }
  }

  if (
    fieldType instanceof GraphQLScalarType && fieldType.name.toLowerCase() === "PositiveInt".toLowerCase() ||
    fieldType instanceof GraphQLNonNull && fieldType.ofType.toString().toLowerCase() === "PositiveInt".toLowerCase()
  ) {
    result = {
      ...result, 
      type: 'integer',
      minimum: 1
    }
  }

  if (
    fieldType instanceof GraphQLScalarType && fieldType.name.toLowerCase() === "Date".toLowerCase() ||
    fieldType instanceof GraphQLNonNull && fieldType.ofType.toString().toLowerCase() === "Date".toLowerCase()
  ) {
    result = {
      ...result, 
      format: "date"
    }
  }

  if (
    fieldType instanceof GraphQLScalarType && fieldType.name.toLowerCase() === "CountryCode".toLowerCase() ||
    fieldType instanceof GraphQLNonNull && fieldType.ofType.toString().toLowerCase() === "CountryCode".toLowerCase()
  ) {
    result = {
      ...result, 
      type: 'string',
      pattern: '^[A-Z]{2}$',
      maxLength: 2,
    }
  }

  if (ceramicExtensions) {
    if (ceramicExtensions?.length !== undefined) {
      result = {
        ...result, 
        type: 'string',
        maxLength: ceramicExtensions.length.max,
        minLength: ceramicExtensions.length.min,
      }
    }
    
    if (ceramicExtensions?.ipfs !== undefined) {
      result = {
        ...result, 
        type: 'string',
        pattern: ceramicExtensions.ipfs.pattern,
      }
    }

    if (ceramicExtensions?.intValue !== undefined) {
      result = {
        ...result, 
        type: 'integer',
        max: ceramicExtensions.intValue.max,
        min: ceramicExtensions.intValue.min,
      }
    }

    if (ceramicExtensions?.floatValue !== undefined) {
      result = {
        ...result, 
        type: 'number',
        max: ceramicExtensions.floatValue.max,
        min: ceramicExtensions.floatValue.min,
      }
    }
  } 
  return result
}
