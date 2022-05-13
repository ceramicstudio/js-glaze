import {
  mapSchema,
  getDirective,
  MapperKind 
} from '@graphql-tools/utils';
import { 
  GraphQLSchema,
  GraphQLNonNull
} from 'graphql';
import { CeramicStringType } from './ceramicStringType';

/*
  directive @length(max: Int!, min: Int = 0) on FIELD_DEFINITION
*/

export function lengthDirectiveTransformer(
  schema: GraphQLSchema
): GraphQLSchema {
  return  mapSchema(schema, {
    // Executes once for each object field definition in the schema
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const lengthDirective = getDirective(schema, fieldConfig, 'length')?.[0];
      if (lengthDirective) {
        const fieldName = fieldConfig.astNode?.name.value || ""
        fieldConfig.type = new GraphQLNonNull(
          new CeramicStringType(
            fieldName,
            `ceramicStringType`,
            [lengthDirective]
          )
        )
        fieldConfig.extensions = {
          ...fieldConfig.extensions,
          ceramicExtensions: {
            length: {
              ceramicDirectiveName: "length",
              min: lengthDirective.min,
              max: lengthDirective.max,
            }
          }
        }
      }
      return fieldConfig;
    },
  });
}
