import {
  mapSchema,
  getDirective,
  MapperKind 
} from '@graphql-tools/utils';
import { 
  GraphQLSchema
} from 'graphql';

/*
  directive @model(
    index: ModelIndexType = LIST
    description: String
    url: String
  ) on OBJECT
*/

export function modelDirectiveTransformer(
  schema: GraphQLSchema
): GraphQLSchema {
  return  mapSchema(schema, {
    // Executes once for each object field definition in the schema
    [MapperKind.OBJECT_TYPE]: (objectConfig) => {
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
    },
  });
}
