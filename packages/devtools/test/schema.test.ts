/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { compositeModelsAndCommonEmbedsFromGraphQLSchema } from '../src/schema'
import { compositeExample } from './exampleSchemas/compositeExample.schema'
import { graphQLSchemaWithoutModels } from './exampleSchemas/graphQLSchemaWithoutModels.schema'
import ajv from 'ajv/dist/2020'

describe('schema', () => {
  it("compositeModelsAndCommonEmbedsFromGraphQLSchema throws when there's no top-level model object", () => {
    expect(() => {
      compositeModelsAndCommonEmbedsFromGraphQLSchema(graphQLSchemaWithoutModels)
    }).toThrow('No models found in Composite Definition Schema')
  })

  it("compositeModelsAndCommonEmbedsFromGraphQLSchema doesn't parse unions", () => {
    expect(() => {
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      union IntOrString = Int | String

      type ModelWithUnionProp @model(
        accountRelation: LINK,
        description: "Test model with a property that is a union of string and int"
      ) {
        intOrStringValue: IntOrString
      }
      `)
    }).toThrow('GraphQL unions are not supported')
  })

  it("compositeModelsAndCommonEmbedsFromGraphQLSchema doesn't parse interfaces", () => {
    expect(() => {
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      interface GenericProfile {
        name: String @length(max: 150)
      }
       
      type SocialProfile implements GenericProfile @model(
        accountRelation: LINK,
        description: "A model to store properties that accounts would like to share on social media"
      ) {
        description: String @length(max: 420)
        emoji: String @length(max: 2)
        url: String @length(max: 240)
      }
      `)
    }).toThrow('GraphQL interfaces are not supported')
  })

  it('compositeModelsAndCommonEmbedsFromGraphQLSchema creates an InternalCompositeDefinition for profiles from schema', () => {
    expect(compositeModelsAndCommonEmbedsFromGraphQLSchema(compositeExample)).toMatchSnapshot()
  })

  it('compositeModelsAndCommonEmbedsFromGraphQLSchema creates models whose schemas conform to JSON Schema standard', () => {
    const compositeDefinition = compositeModelsAndCommonEmbedsFromGraphQLSchema(compositeExample)
    const [genericProfile, socialProfile, personalProfile] = compositeDefinition.models

    const validator = new ajv()
    expect(validator.validateSchema(genericProfile.schema, true)).toBe(true)
    expect(validator.validateSchema(socialProfile.schema, true)).toBe(true)
    expect(validator.validateSchema(personalProfile.schema, true)).toBe(true)
  })

  it('DID scalar is supported and properly converted to ICD', () => {
    expect(
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithDIDProp @model(
        accountRelation: LINK,
        description: "Test model with DID properties"
      ) {
        didValue: DID
        requiredDidValue: DID!
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithDIDProp',
          accountRelation: 'link',
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              didValue: {
                type: 'string',
                title: 'DID',
                pattern:
                  "/^did:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/",
                maxLength: 80,
              },
              requiredDidValue: {
                type: 'string',
                title: 'DID',
                pattern:
                  "/^did:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/",
                maxLength: 80,
              },
            },
            additionalProperties: false,
            required: ['requiredDidValue'],
          },
        },
      ],
    })
  })

  it('@documentAccount is only valid for DIDs', () => {
    expect(() => {
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithInvalidDocumentAccountProp @model(
        accountRelation: LINK,
        description: "Test model with an invalid @documentAccount directive"
      ) {
        nonDIDValue: String @documentAccount
      }
      `)
    }).toThrow('@documentAccount can only be applied to DIDs')
  })

  it('fields annotated with @documentAccount are not added to the resulting schema', () => {
    const compositeDefinition = compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithDocumentVersionProp @model(
        accountRelation: LINK,
        description: "Test model with a @documentAccount directive"
      ) {
        floatProp: Float!
        didProp: DID @documentAccount
      }
      `)
    expect(compositeDefinition.models.length).toEqual(1)
    const properties = compositeDefinition.models[0].schema.properties
    expect(properties).not.toBeFalsy()
    expect(Object.keys(properties!).length).toEqual(1)
    expect(Object.keys(properties!)[0]).toEqual('floatProp')
  })

  it('StreamReference scalar is supported and properly converted to ICD', () => {
    expect(
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithStreamReferenceProp @model(
        accountRelation: LINK,
        description: "Test model with stream reference properties"
      ) {
        streamReferenceValue: StreamReference
        requiredStreamReferenceValue: StreamReference!
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithStreamReferenceProp',
          accountRelation: 'link',
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              streamReferenceValue: {
                type: 'string',
                title: 'StreamReference',
                maxLength: 80,
              },
              requiredStreamReferenceValue: {
                type: 'string',
                title: 'StreamReference',
                maxLength: 80,
              },
            },
            additionalProperties: false,
            required: ['requiredStreamReferenceValue'],
          },
        },
      ],
    })
  })

  it('@documentVersion is only valid for StreamReferences', () => {
    expect(() => {
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithInvalidDocumentVersionProp @model(
        accountRelation: LINK,
        description: "Test model with an invalid @documentVersion directive"
      ) {
        nonDIDValue: Int @documentVersion
      }
      `)
    }).toThrow('@documentVersion can only be applied to StreamReferences')
  })

  it('fields annotated with @documentVersion are not added to the resulting schema', () => {
    const compositeDefinition = compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithDocumentVersionProp @model(
        accountRelation: LINK,
        description: "Test model with a @documentVersion directive"
      ) {
        numberProp: Int!
        version: StreamReference @documentVersion
      }
      `)
    expect(compositeDefinition.models.length).toEqual(1)
    const properties = compositeDefinition.models[0].schema.properties
    expect(properties).not.toBeFalsy()
    expect(Object.keys(properties!).length).toEqual(1)
    expect(Object.keys(properties!)[0]).toEqual('numberProp')
  })

  it('Boolean scalar is supported and properly converted to ICD', () => {
    expect(
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithBooleanProp @model(
        accountRelation: LINK,
        description: "Test model with boolean properties"
      ) {
        booleanValue: Boolean
        requiredBooleanValue: Boolean!
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithBooleanProp',
          accountRelation: 'link',
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              booleanValue: {
                type: 'boolean',
              },
              requiredBooleanValue: {
                type: 'boolean',
              },
            },
            additionalProperties: false,
            required: ['requiredBooleanValue'],
          },
        },
      ],
    })
  })

  it('Int scalar is supported and properly converted to ICD', () => {
    expect(
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithIntProp @model(
        accountRelation: LINK,
        description: "Test model with int properties"
      ) {
        intValue: Int
        requiredIntValue: Int!
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithIntProp',
          accountRelation: 'link',
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              intValue: {
                type: 'integer',
              },
              requiredIntValue: {
                type: 'integer',
              },
            },
            additionalProperties: false,
            required: ['requiredIntValue'],
          },
        },
      ],
    })
  })

  it('Float scalar is supported and properly converted to ICD', () => {
    expect(
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithFloatProp @model(
        accountRelation: LINK,
        description: "Test model with float properties"
      ) {
        floatValue: Float
        requiredFloatValue: Float!
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithFloatProp',
          accountRelation: 'link',
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              floatValue: {
                type: 'number',
              },
              requiredFloatValue: {
                type: 'number',
              },
            },
            additionalProperties: false,
            required: ['requiredFloatValue'],
          },
        },
      ],
    })
  })

  it('String scalar is supported and properly converted to ICD', () => {
    expect(
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithStringProp @model(
        accountRelation: LINK,
        description: "Test model with string properties"
      ) {
        stringValue: String @length(max: 100)
        requiredStringValue: String! @length(max: 100)
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithStringProp',
          accountRelation: 'link',
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              stringValue: {
                type: 'string',
              },
              requiredStringValue: {
                type: 'string',
              },
            },
            additionalProperties: false,
            required: ['requiredStringValue'],
          },
        },
      ],
    })
  })

  it('@length is required for Strings', () => {
    expect(() => {
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithStringPropWithoutLengthDirective @model(
        accountRelation: LINK,
        description: "Test model with string property without @length directive"
      ) {
        stringValue: String
      }
      `)
    }).toThrow('Missing @length directive')
  })

  it('@length is required for arrays Strings', () => {
    expect(() => {
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithStringArrayPropWithoutLengthDirective @model(
        accountRelation: LINK,
        description: "Test model with string array property without @length directive"
      ) {
        stringArrayValue: [String] @arrayLength(max: 1)
      }
      `)
    }).toThrow('Missing @length directive')
  })

  it('ID scalar is supported and properly converted to ICD', () => {
    expect(
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithIDProp @model(
        accountRelation: LINK,
        description: "Test model with GraphQL ID property"
      ) {
        idValue: ID
        requiredIdValue: ID!
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithIDProp',
          accountRelation: 'link',
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              idValue: {
                type: 'string',
                title: 'GraphQLID',
              },
              requiredIdValue: {
                type: 'string',
                title: 'GraphQLID',
              },
            },
            additionalProperties: false,
            required: ['requiredIdValue'],
          },
        },
      ],
    })
  })

  it('@length(min: Int, max: Int) directive is supported for strings and properly converted to ICD', () => {
    expect(
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithStringProp @model(
        accountRelation: LINK,
        description: "Test model with a constrained string property"
      ) {
        stringValue: String @length(min: 1, max: 140)
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithStringProp',
          accountRelation: 'link',
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              stringValue: {
                type: 'string',
                minLength: 1,
                maxLength: 140,
              },
            },
            additionalProperties: false,
          },
        },
      ],
    })
  })

  it('@intRange(min: Int, max: Int) can be applied to Int, Int! or [Int] properties', () => {
    expect(() => {
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithStringProp @model(
        accountRelation: LINK,
        description: "Test model with incorrectly constrained string property"
      ) {
        intValue: String @length(max: 10) @intRange(min: 1)
      }
      `)
    }).toThrow('@intRange can only be applied to integers or arrays of integers')
  })

  it('@floatRange(min: Int, max: Int) can be applied to Float, Float! or [Float] properties', () => {
    expect(() => {
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithIntProp @model(
        accountRelation: LINK,
        description: "Test model with incorrectly constrained int property"
      ) {
        intValue: Int @floatRange(max: 1)
      }
      `)
    }).toThrow('@floatRange can only be applied to floats or arrays of floats')
  })

  it('@length(min: Int, max: Int) can be applied to strings or arrays of strings', () => {
    expect(() => {
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithArrayProp @model(
        accountRelation: LINK,
        description: "Test model with incorrectly constrained array property"
      ) {
        intValue: [Int] @length(min:10, max: 140)
      }
      `)
    }).toThrow('@length can only be applied to strings or arrays of strings')
  })

  it('@arrayLength(min: Int, max: Int) can be applied to arrays', () => {
    expect(() => {
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithStringProp @model(
        accountRelation: LINK,
        description: "Test model with incorrectly constrained strings property"
      ) {
        intValue: String @length(max: 10) @arrayLength(max: 140)
      }
      `)
    }).toThrow('@arrayLength can only be applied to arrays')
  })

  it('@arrayLength(min: Int, max: Int) directive is supported for arrays and properly converted to ICD', () => {
    expect(
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithArrayProp @model(
        accountRelation: LINK,
        description: "Test model with a constrained array property"
      ) {
        arrayValue: [String] @length(max: 10) @arrayLength(min: 10, max: 15)
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithArrayProp',
          accountRelation: 'link',
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              arrayValue: {
                type: 'array',
                minItems: 10,
                maxItems: 15,
                items: {
                  type: 'string',
                },
              },
            },
            additionalProperties: false,
          },
        },
      ],
    })
  })

  it('@length(min: Int, max: Int) directive is supported for arrays of strings and properly converted to ICD', () => {
    expect(
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithArrayProp @model(
        accountRelation: LINK,
        description: "Test model with an array property with constrained items"
      ) {
        arrayValue: [String] @length(min: 4, max: 440) @arrayLength(max: 10)
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithArrayProp',
          accountRelation: 'link',
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              arrayValue: {
                type: 'array',
                items: {
                  type: 'string',
                  minLength: 4,
                  maxLength: 440,
                },
              },
            },
            additionalProperties: false,
          },
        },
      ],
    })
  })

  it('@arrayLength is required for arrays', () => {
    expect(() => {
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithArrayPropWithoutArrayLengthDirective @model(
        accountRelation: LINK,
        description: "Test model with an array property without @arrayLength directive"
      ) {
        arrayValue: [Int]
      }
      `)
    }).toThrow('Missing @arrayLength directive')
  })

  it('@intRange(min: Int, max: Int) directive is supported and properly converted to ICD', () => {
    expect(
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithIntProp @model(
        accountRelation: LINK,
        description: "Test model with a constreained int property"
      ) {
        intValue: Int @intRange(min: 5, max: 10)
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithIntProp',
          accountRelation: 'link',
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              intValue: {
                type: 'integer',
                minimum: 5,
                maximum: 10,
              },
            },
            additionalProperties: false,
          },
        },
      ],
    })
  })

  it('@floatRange(min: Float, max: Float) directive is supported and properly converted to ICD', () => {
    expect(
      compositeModelsAndCommonEmbedsFromGraphQLSchema(`
      type ModelWithFloatProp @model(
        accountRelation: LINK,
        description: "Test model with a constrained float property"
      ) {
        floatValue: Float @floatRange(min: 5.0, max: 10.0)
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithFloatProp',
          accountRelation: 'link',
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              floatValue: {
                type: 'number',
                minimum: 5.0,
                maximum: 10.0,
              },
            },
            additionalProperties: false,
          },
        },
      ],
    })
  })
})
