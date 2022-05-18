import {
  mapSchema,
  getDirective,
  MapperKind 
} from '@graphql-tools/utils';
import { 
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLFieldConfig
} from 'graphql';

function objectConfigMapperFactory(
  schema: GraphQLSchema
): (objectConfig: GraphQLObjectType<any, any>) => GraphQLObjectType<any, any> {
  function objectConfigMapper(
    objectConfig: GraphQLObjectType<any, any>
  ) : GraphQLObjectType<any, any> {
    const modelDirective = getDirective(schema, objectConfig, 'model')?.[0];
      if (modelDirective) {
        objectConfig.extensions = {
          ...objectConfig.extensions,
          ceramicExtensions: [
            {
              ceramicDirectiveName: "model",
              accountRelation: modelDirective['index'].toLowerCase(),
              modelDescription: modelDirective['description'],
            }
          ]
        }
      }
      return objectConfig;
  }
  return objectConfigMapper
}

function fieldConfigMapperFactory(
  schema: GraphQLSchema
): (fieldConfig: GraphQLFieldConfig<any, any, any>) => GraphQLFieldConfig<any, any, any> {
  function fieldConfigMapper(
    fieldConfig: GraphQLFieldConfig<any, any, any>
  ) : GraphQLFieldConfig<any, any, any> {
    let ceramicExtensions: Record<string, any> = {}
    // TODO: Add valication to check, if custom directive are applied to the right field types?
    // E.g. @itemLength should only work for arrays, etc.
    const itemLengthDirective = getDirective(schema, fieldConfig, 'itemLength')?.[0];
    if (itemLengthDirective) {
      ceramicExtensions = {
        ...ceramicExtensions,
        itemLength: {
          ceramicDirectiveName: "itemLength",
          min: itemLengthDirective.min || undefined,
          max: itemLengthDirective.max || undefined,
        }
      }
    }
    const lengthDirective = getDirective(schema, fieldConfig, 'length')?.[0];
    if (lengthDirective) {
      ceramicExtensions = {
        ...ceramicExtensions,
        length: {
          ceramicDirectiveName: "length",
          min: lengthDirective.min || undefined,
          max: lengthDirective.max || undefined,
        }
      }
    }

    const ipfsDirective = getDirective(schema, fieldConfig, 'ipfs')?.[0];
    if (ipfsDirective) {
      ceramicExtensions = {
        ...ceramicExtensions,
        ipfs: {
          ceramicDirectiveName: "ipfs",
          pattern: "^ipfs://.+",
          max: 150,
        }
      }
    }

    if (Object.keys(ceramicExtensions).length > 0) {
      fieldConfig.extensions = {
        ...fieldConfig.extensions,
        ceramicExtensions: ceramicExtensions
      }
    }
    return fieldConfig;
  }
  return fieldConfigMapper
}

export function compositeDirectivesTransformer(
  schema: GraphQLSchema
): GraphQLSchema {
  return  mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: objectConfigMapperFactory(schema),
    [MapperKind.OBJECT_FIELD]: fieldConfigMapperFactory(schema),
  });
}
