import type { StreamRef } from '@ceramicnetwork/streamid'
import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import {
  mapSchema,
  getDirective,
  MapperKind 
} from '@graphql-tools/utils';
import { InternalCompositeDefinition, JSONSchema, ModelDefinition } from '@glazed/types';
import { Composite } from './composite';
import { compositeDirectivesTransformer } from './graphQlDirectives/compositeDirectivesTransformer';

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

const ceramicTypeDefs = `
# From graphql-scalars

scalar CountryCode
scalar Date
scalar DateTime
scalar DID
scalar PositiveInt
scalar Time
scalar URL

# Custom Ceramic scalars

scalar StreamID

# Field validation directives

directive @ipfs on FIELD_DEFINITION # Must be an IPFS URL
directive @length(max: Int!, min: Int = 0) on FIELD_DEFINITION

# Metadata access directives

directive @documentAccount on FIELD_DEFINITION
directive @documentVersion on FIELD_DEFINITION

# Model definition

enum ModelIndexType {
  LIST # Account to multiple streams - default
  SET # Account to multiple streams but only one reference
  LINK # Account to single stream (IDX)
  NONE # Indexing explicitly disabled
}
directive @model(
  index: ModelIndexType = LIST
  description: String
  url: String
) on OBJECT
# When a model has index = SET, at least one field must have the @index directive
directive @index on FIELD_DEFINITION

# Account-based relations

enum AccountLinkTarget {
  SELF
  OTHER
  BOTH
}
directive @accountLink(
  property: String!
  target: AccountLinkTarget!
) on FIELD_DEFINITION
directive @accountReference on FIELD_DEFINITION
directive @accountRelation(property: String!) on FIELD_DEFINITION

# Model-based relations

directive @modelReference(type: String!) on FIELD_DEFINITION
directive @modelRelation(property: String!) on FIELD_DEFINITION
`

/** @internal */
export function buildCompositeSchema(sdl: string): GraphQLSchema {
  return (
    compositeDirectivesTransformer(
      makeExecutableSchema({typeDefs: [ceramicTypeDefs, sdl]})
    )
  ) 
}

function fieldSchemaFromFieldDefinition(
  fieldDefinition: Record<string, any>
  ): Record<string, any> | undefined {
  const ceramicExtensions = fieldDefinition.extensions?.ceramicExtensions
  if (ceramicExtensions) {
    let result: Record<string, any> = {}
    if (ceramicExtensions?.length !== undefined) {
      result = {
        ...result, 
        type: 'string',
        title: fieldDefinition.name,
        maxLength: ceramicExtensions.length.max,
        minLength: ceramicExtensions.length.min,
      }
    }
    if (fieldDefinition.type.name === "URL") {
      result = {
        ...result, 
        type: 'string',
        title: fieldDefinition.name,
        pattern: "^[http|https]://.+",
      }
    }
    if (ceramicExtensions?.ipfs !== undefined) {
      result = {
        ...result, 
        type: 'string',
        title: fieldDefinition.name,
        pattern: ceramicExtensions.ipfs.pattern,
      }
    }
    return result
  } else {
    return {
      type: fieldDefinition.type.toString(),
      title: fieldDefinition.name,
    }
  }
}

/** @internal */
export function compositeDefinitionFromSchema(schema: string | GraphQLSchema): InternalCompositeDefinition {
  if (typeof schema === 'string') {
    schema = buildCompositeSchema(schema)
  }

  let models: Record<string, ModelDefinition> = {}
  let definitions : Record<string, JSONSchema.Object> = {}

  mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (objectConfig: GraphQLObjectType) => {
      const modelSchema:Record<string, any> = {}
      for (const [fieldName, fieldDefinition] of Object.entries(objectConfig.getFields())) {
        modelSchema[fieldName] = fieldSchemaFromFieldDefinition(fieldDefinition)
      }

      const modelDirective = getDirective(schema as GraphQLSchema, objectConfig, 'model')?.[0];
      if (modelDirective) {
        models[objectConfig.name] = {
          name: objectConfig.name, 
          accountRelation: modelDirective.index.toLowerCase(), // TODO: Should we validate here that the value is an ModelAccountRelation?
          description: modelDirective.description,
          schema: modelSchema
        }
      } else {
        definitions[objectConfig.name] = modelSchema
      }
      return objectConfig;
    },
  })

  console.log("models", models)
  console.log("definitions", definitions)

  if (Object.keys(models).length === 0) {
    throw new Error("No models found in Composite Definition Schema")
  }

  const result = {
    version: Composite.VERSION,
    models: models
  }

  if (Object.keys(definitions).length > 0) {
    // @ts-ignore
    result["#definitions"] = definitions
  }

  const util = require('util')
  console.log("result", util.inspect(result, false, null, true /* enable colors */))

  return result
}
