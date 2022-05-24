import {
  mapSchema,
  getDirective,
  MapperKind 
} from '@graphql-tools/utils';
import { 
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLFieldConfig,
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
              accountRelation: modelDirective['accountRelation'].toLowerCase(),
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

    const indexDirectiveName = "index"
    const indexDirective = getDirective(schema, fieldConfig, indexDirectiveName)?.[0];
    if (indexDirective) {
      ceramicExtensions = {
        ...ceramicExtensions,
        [indexDirectiveName]: { ceramicDirectiveName: indexDirectiveName }
      }
    }

    // TODO: Add valication to check, if custom directive are applied to the right field types?
    // E.g. @arrayLength should only work for arrays, etc.
    const arrayLengthDirectiveName = "arrayLength"
    const arrayLengthDirective = getDirective(schema, fieldConfig, arrayLengthDirectiveName)?.[0];
    if (arrayLengthDirective) {
      ceramicExtensions = {
        ...ceramicExtensions,
        [arrayLengthDirectiveName]: {
          ceramicDirectiveName: arrayLengthDirectiveName,
          min: arrayLengthDirective.min || undefined,
          max: arrayLengthDirective.max || undefined,
        }
      }
    }

    // TODO: This needs to work differently for srings and for arrays of strings
    const lengthDirectiveName = "length"
    const lengthDirective = getDirective(schema, fieldConfig, lengthDirectiveName)?.[0];
    if (lengthDirective) {
      ceramicExtensions = {
        ...ceramicExtensions,
        [lengthDirectiveName]: {
          ceramicDirectiveName: lengthDirectiveName,
          min: lengthDirective.min || undefined,
          max: lengthDirective.max || undefined,
        }
      }
    }

    ["intRange", "floatRange"].forEach(valueDirectiveName => {
      const valueDirective = getDirective(schema, fieldConfig, valueDirectiveName)?.[0];
    if (valueDirective) {
      ceramicExtensions = {
        ...ceramicExtensions,
        [valueDirectiveName]: {
          ceramicDirectiveName: valueDirectiveName,
          min: valueDirective.min || undefined,
          max: valueDirective.max || undefined,
        }
      }
    }
    })

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
