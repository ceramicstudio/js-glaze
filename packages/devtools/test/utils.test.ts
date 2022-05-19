/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { applyMap, promiseMap, internalCompositeDefinitionFromGraphQLSchema } from '../src'
import { compositeDefinitionWithProfiles } from './exampleCompositeDefinitions/compositeDefinitionWithProfiles'
import { compositeSchemaWithProfiles } from './exampleSchemas/compositeSchemaWithProfiles.schema'
import { graphQLSchemaWithoutModels } from './exampleSchemas/graphQLSchemaWithoutModels.schema'
import ajv from 'ajv'

describe('utils', () => {
  it('applyMap applies the given function to all values in a record', () => {
    const res = applyMap({ one: 1, two: 2 }, (v) => v * 2)
    expect(res).toEqual({ one: 2, two: 4 })
  })

  it('promiseMap applies the given async function to all values in a record', async () => {
    const res = await promiseMap({ one: 1, two: 2 }, (v) => Promise.resolve(v * 2))
    expect(res).toEqual({ one: 2, two: 4 })
  })

  it('internalCompositeDefinitionFromGraphQLSchema throws when there\'s no top-level model object', () => {
    expect(() => {
      internalCompositeDefinitionFromGraphQLSchema(graphQLSchemaWithoutModels)
    }).toThrow("No models found in Composite Definition Schema")
  })

  it('internalCompositeDefinitionFromGraphQLSchema creates an InternalCompositeDefinition for profiles from schema', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(
        compositeSchemaWithProfiles
      )
    ).toMatchObject(
      compositeDefinitionWithProfiles
    )
  })

  it('internalCompositeDefinitionFromGraphQLSchema creates models whose schemas conform to JSON Schema standard', () => {
    const compositeDefinition = internalCompositeDefinitionFromGraphQLSchema(
      compositeSchemaWithProfiles
    )
    const { 
      GenericProfileID, 
      SocialProfileID, 
      PersonProfileID 
    } = compositeDefinition.models
    
    const validator = new ajv()
    expect(validator.validateSchema(GenericProfileID.schema, true)).toBe(true)
    expect(validator.validateSchema(SocialProfileID.schema, true)).toBe(true)
    expect(validator.validateSchema(PersonProfileID.schema, true)).toBe(true)
  })

  it('DID scalar is supported and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithDIDProp @model(index: LINK) {
        didValue: DID
        requiredDidValue: DID!
      }
      `)
    ).toMatchObject({
      version: "1.0",
      models: {
        ModelWithDIDPropID: {
          name: "ModelWithDIDProp",
          accountRelation: 'link',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              didValue: {
                type: 'string',
                title: 'DID',
                pattern: "/^did:[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+:[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+$/",
                maxLength: 80
              },
              requiredDidValue: {
                type: 'string',
                title: 'DID',
                pattern: "/^did:[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+:[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+$/",
                maxLength: 80
              },
            },
            required: ['requiredDidValue']
          }
        }
      }
    })
  })

  it('StreamReference scalar is supported and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithStreamReferenceProp @model(index: LINK) {
        streamReferenceValue: StreamReference
        requiredStreamReferenceValue: StreamReference!
      }
      `)
    ).toMatchObject({
      version: "1.0",
      models: {
        ModelWithStreamReferencePropID: {
          name: "ModelWithStreamReferenceProp",
          accountRelation: 'link',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              streamReferenceValue: {
                type: "string",
                title: "StreamReference",
                pattern: "<TBD>",
                maxLength: 80
              },
              requiredStreamReferenceValue: {
                type: "string",
                title: "StreamReference",
                pattern: "<TBD>",
                maxLength: 80
              },
            },
            required: ['requiredStreamReferenceValue']
          }
        }
      }
    })
  })

  it('Boolean scalar is supported and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithBooleanProp @model(index: LINK) {
        booleanValue: Boolean
        requiredBooleanValue: Boolean!
      }
      `)
    ).toMatchObject({
      version: "1.0",
      models: {
        ModelWithBooleanPropID: {
          name: "ModelWithBooleanProp",
          accountRelation: 'link',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              booleanValue: {
                type: "boolean",
              },
              requiredBooleanValue: {
                type: "boolean",
              },
            },
            required: ['requiredBooleanValue']
          }
        }
      }
    })
  })

  it('Int scalar is supported and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithIntProp @model(index: LINK) {
        intValue: Int
        requiredIntValue: Int!
      }
      `)
    ).toMatchObject({
      version: "1.0",
      models: {
        ModelWithIntPropID: {
          name: "ModelWithIntProp",
          accountRelation: 'link',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              intValue: {
                type: "integer",
              },
              requiredIntValue: {
                type: "integer",
              },
            },
            required: ["requiredIntValue"]
          }
        }
      }
    })
  })

  it('Float scalar is supported and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithFloatProp @model(index: LINK) {
        floatValue: Float
        requiredFloatValue: Float!
      }
      `)
    ).toMatchObject({
      version: "1.0",
      models: {
        ModelWithFloatPropID: {
          name: "ModelWithFloatProp",
          accountRelation: 'link',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              floatValue: {
                type: "number",
              },
              requiredFloatValue: {
                type: "number",
              },
            },
            required: ["requiredFloatValue"]
          }
        }
      }
    })
  })

  it('String scalar is supported and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithStringProp @model(index: LINK) {
        stringValue: String
        requiredStringValue: String!
      }
      `)
    ).toMatchObject({
      version: "1.0",
      models: {
        ModelWithStringPropID: {
          name: "ModelWithStringProp",
          accountRelation: 'link',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              stringValue: {
                type: "string",
              },
              requiredStringValue: {
                type: "string",
              },
            },
            required: ["requiredStringValue"]
          }
        }
      }
    })
  })

  it('ID scalar is supported and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithIDProp @model(index: LINK) {
        idValue: ID
        requiredIdValue: ID!
      }
      `)
    ).toMatchObject({
      version: "1.0",
      models: {
        ModelWithIDPropID: {
          name: "ModelWithIDProp",
          accountRelation: 'link',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              idValue: {
                type: 'string', 
                title: 'GraphQLID'
              },
              requiredIdValue: {
                type: 'string', 
                title: 'GraphQLID'
              },
            },
            required: ["requiredIdValue"]
          }
        }
      }
    })
  })

  it('@index directive is supported for strings and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithIndexedProp @model(index: SET) {
        indexedProp: String @index
      }
      `)
    ).toMatchObject({
      version: "1.0",
      models: {
        ModelWithIndexedPropID: {
          name: "ModelWithIndexedProp",
          accountRelation: 'set',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              indexedProp: {
                type: 'string',
                index: true
              },
            },
          }
        }
      }
    })
  })

  it('@ipfs directive is supported for strings and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithIPFSURLProp @model(index: LINK) {
        ipfsURLValue: String @ipfs
      }
      `)
    ).toMatchObject({
      version: "1.0",
      models: {
        ModelWithIPFSURLPropID: {
          name: "ModelWithIPFSURLProp",
          accountRelation: 'link',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              ipfsURLValue: {
                type: 'string',
                pattern: "^ipfs://.+",
              },
            },
          }
        }
      }
    })
  })

  it('@length(min: Int, max: Int) directive is supported for strings and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithStringProp @model(index: LINK) {
        stringValue: String @length(min: 1, max: 140)
      }
      `)
    ).toMatchObject({
      version: "1.0",
      models: {
        ModelWithStringPropID: {
          name: "ModelWithStringProp",
          accountRelation: 'link',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              stringValue: {
                type: 'string',
                minLength: 1,
                maxLength: 140,
              },
            },
          }
        }
      }
    })
  })

  it('@length(min: Int, max: Int) directive is supported for arrays and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithArrayProp @model(index: LINK) {
        arrayValue: [String] @length(min: 10, max: 15)
      }
      `)
    ).toMatchObject({
      version: "1.0",
      models: {
        ModelWithArrayPropID: {
          name: "ModelWithArrayProp",
          accountRelation: 'link',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              arrayValue: {
                type: 'array',
                minItems: 10,
                maxItems: 15,
                items: {
                  type: 'string'
                }
              },
            },
          }
        }
      }
    })
  })

  it('@itemLength(min: Int, max: Int) directive is supported for arrays and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithArrayProp @model(index: LINK) {
        arrayValue: [String] @itemLength(min: 4, max: 440)
      }
      `)
    ).toMatchObject({
      version: "1.0",
      models: {
        ModelWithArrayPropID: {
          name: "ModelWithArrayProp",
          accountRelation: 'link',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              arrayValue: {
                type: 'array',
                items: {
                  type: 'string',
                  minLength: 4,
                  maxLength: 440,
                }
              },
            },
          }
        }
      }
    })
  })

  it('@intRange(min: Int, max: Int) directive is supported and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithIntProp @model(index: LINK) {
        intValue: Int @intRange(min: 5, max: 10)
      }
      `)
    ).toMatchObject({
      version: "1.0",
      models: {
        ModelWithIntPropID: {
          name: "ModelWithIntProp",
          accountRelation: 'link',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              intValue: {
                type: 'integer',
                min: 5,
                max: 10,
              },
            },
          }
        }
      }
    })
  })

  it('@floatRange(min: Float, max: Float) directive is supported and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithFloatProp @model(index: LINK) {
        floatValue: Float @floatRange(min: 5.0, max: 10.0)
      }
      `)
    ).toMatchObject({
      version: "1.0",
      models: {
        ModelWithFloatPropID: {
          name: "ModelWithFloatProp",
          accountRelation: 'link',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              floatValue: {
                type: 'number',
                min: 5.0,
                max: 10.0,
              },
            },
          }
        }
      }
    })
  })
})
