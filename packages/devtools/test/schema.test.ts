/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { ImageMetadataType, profilesSchema } from '@glazed/test-schemas'
import ajv from 'ajv/dist/2020'

import { parseCompositeSchema } from '../src'

describe('schema', () => {
  it("parseCompositeSchema throws when there's no top-level model object", () => {
    expect(() => {
      parseCompositeSchema(ImageMetadataType)
    }).toThrow('No models found in Composite Definition Schema')
  })

  it("parseCompositeSchema doesn't parse unions", () => {
    expect(() => {
      parseCompositeSchema(`
      union IntOrString = Int | String

      type ModelWithUnionProp @model(
        accountRelation: SINGLE,
        description: "Test model with a property that is a union of string and int"
      ) {
        intOrStringValue: IntOrString
      }
      `)
    }).toThrow('GraphQL unions are not supported')
  })

  it("parseCompositeSchema doesn't parse interfaces", () => {
    expect(() => {
      parseCompositeSchema(`
      interface GenericProfile {
        name: String @length(max: 150)
      }
       
      type SocialProfile implements GenericProfile @model(
        accountRelation: SINGLE,
        description: "A model to store properties that accounts would like to share on social media"
      ) {
        description: String @length(max: 420)
        emoji: String @length(max: 2)
        url: String @length(max: 240)
      }
      `)
    }).toThrow('GraphQL interfaces are not supported')
  })

  it('parseCompositeSchema creates an InternalCompositeDefinition for profiles from schema', () => {
    expect(parseCompositeSchema(profilesSchema)).toMatchSnapshot()
  })

  it('parseCompositeSchema creates models whose schemas conform to JSON Schema standard', () => {
    const compositeDefinition = parseCompositeSchema(profilesSchema)
    const [genericProfile, socialProfile, personalProfile] = compositeDefinition.models

    const validator = new ajv()
    expect(validator.validateSchema(genericProfile.schema, true)).toBe(true)
    expect(validator.validateSchema(socialProfile.schema, true)).toBe(true)
    expect(validator.validateSchema(personalProfile.schema, true)).toBe(true)
  })

  it('DID scalar is supported and properly converted to ICD', () => {
    expect(
      parseCompositeSchema(`
      type ModelWithDIDProp @model(
        accountRelation: SINGLE,
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
          accountRelation: 'single',
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              didValue: {
                type: 'string',
                title: 'GraphQLDID',
                pattern:
                  "/^did:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/",
                maxLength: 100,
              },
              requiredDidValue: {
                type: 'string',
                title: 'GraphQLDID',
                pattern:
                  "/^did:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/",
                maxLength: 100,
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
      parseCompositeSchema(`
      type ModelWithInvalidDocumentAccountProp @model(
        accountRelation: SINGLE,
        description: "Test model with an invalid @documentAccount directive"
      ) {
        nonDIDValue: String @documentAccount
      }
      `)
    }).toThrow('@documentAccount can only be applied to DIDs')
  })

  it('fields annotated with @documentAccount are not added to the resulting schema', () => {
    const compositeDefinition = parseCompositeSchema(`
      type ModelWithDocumentVersionProp @model(
        accountRelation: SINGLE,
        description: "Test model with a @documentAccount directive"
      ) {
        floatProp: Float!
        didProp: DID @documentAccount
      }
      `)
    expect(compositeDefinition.models.length).toEqual(1)
    const properties = compositeDefinition.models[0].schema.properties ?? {}
    expect(properties).not.toBeFalsy()
    expect(Object.keys(properties).length).toEqual(1)
    expect(Object.keys(properties)[0]).toEqual('floatProp')
  })

  it('CommitID scalar is supported and properly converted to ICD', () => {
    expect(
      parseCompositeSchema(`
      type ModelWithCommitIDProp @model(
        accountRelation: SINGLE,
        description: "Test model with stream reference properties"
      ) {
        commitIDValue: CommitID
        requiredCommitIDValue: CommitID!
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithCommitIDProp',
          accountRelation: 'single',
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              commitIDValue: {
                type: 'string',
                title: 'CeramicCommitID',
                maxLength: 200,
              },
              requiredCommitIDValue: {
                type: 'string',
                title: 'CeramicCommitID',
                maxLength: 200,
              },
            },
            additionalProperties: false,
            required: ['requiredCommitIDValue'],
          },
        },
      ],
    })
  })

  it('@documentVersion is only valid for CommitIDs', () => {
    expect(() => {
      parseCompositeSchema(`
      type ModelWithInvalidDocumentVersionProp @model(
        accountRelation: SINGLE,
        description: "Test model with an invalid @documentVersion directive"
      ) {
        nonDIDValue: Int @documentVersion
      }
      `)
    }).toThrow('@documentVersion can only be applied to CommitIDs')
  })

  it('fields annotated with @documentVersion are not added to the resulting schema', () => {
    const compositeDefinition = parseCompositeSchema(`
      type ModelWithDocumentVersionProp @model(
        accountRelation: SINGLE,
        description: "Test model with a @documentVersion directive"
      ) {
        numberProp: Int!
        version: CommitID @documentVersion
      }
      `)
    expect(compositeDefinition.models.length).toEqual(1)
    const properties = compositeDefinition.models[0].schema.properties ?? {}
    expect(properties).not.toBeFalsy()
    expect(Object.keys(properties).length).toEqual(1)
    expect(Object.keys(properties)[0]).toEqual('numberProp')
  })

  it('Boolean scalar is supported and properly converted to ICD', () => {
    expect(
      parseCompositeSchema(`
      type ModelWithBooleanProp @model(
        accountRelation: SINGLE,
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
          accountRelation: 'single',
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
      parseCompositeSchema(`
      type ModelWithIntProp @model(
        accountRelation: SINGLE,
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
          accountRelation: 'single',
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
      parseCompositeSchema(`
      type ModelWithFloatProp @model(
        accountRelation: SINGLE,
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
          accountRelation: 'single',
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
      parseCompositeSchema(`
      type ModelWithStringProp @model(
        accountRelation: SINGLE,
        description: "Test model with string properties"
      ) {
        stringValue: String @length(max: 3)
        requiredStringValue: String! @length(max: 3)
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithStringProp',
          accountRelation: 'single',
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
      parseCompositeSchema(`
      type ModelWithStringPropWithoutLengthDirective @model(
        accountRelation: SINGLE,
        description: "Test model with string property without @length directive"
      ) {
        stringValue: String
      }
      `)
    }).toThrow('Missing @length directive')
  })

  it('@length is required for arrays Strings', () => {
    expect(() => {
      parseCompositeSchema(`
      type ModelWithStringArrayPropWithoutLengthDirective @model(
        accountRelation: SINGLE,
        description: "Test model with string array property without @length directive"
      ) {
        stringArrayValue: [String] @arrayLength(max: 1)
      }
      `)
    }).toThrow('Missing @length directive')
  })

  it('ID scalar is supported and properly converted to ICD', () => {
    expect(
      parseCompositeSchema(`
      type ModelWithIDProp @model(
        accountRelation: SINGLE,
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
          accountRelation: 'single',
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

  it('Arrays are supported and properly converted to ICD', () => {
    expect(
      parseCompositeSchema(`
      type ModelWithArrayProp @model(
        accountRelation: SINGLE,
        description: "Test model with GraphQL ID property"
      ) {
        arrayValue: [Int] @arrayLength(max: 3)
        requiredArrayValue: [Int]! @arrayLength(max: 3)
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithArrayProp',
          accountRelation: 'single',
          schema: {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            properties: {
              arrayValue: {
                type: 'array',
                items: {
                  type: 'integer',
                },
              },
              requiredArrayValue: {
                type: 'array',
                items: {
                  type: 'integer',
                },
              },
            },
            additionalProperties: false,
            required: ['requiredArrayValue'],
          },
        },
      ],
    })
  })

  it('@length(min: Int, max: Int) directive is supported for strings and properly converted to ICD', () => {
    expect(
      parseCompositeSchema(`
      type ModelWithStringProp @model(
        accountRelation: SINGLE,
        description: "Test model with a constrained string property"
      ) {
        stringValue: String @length(min: 1, max: 140)
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithStringProp',
          accountRelation: 'single',
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
      parseCompositeSchema(`
      type ModelWithStringProp @model(
        accountRelation: SINGLE,
        description: "Test model with incorrectly constrained string property"
      ) {
        intValue: String @intRange(min: 1)
      }
      `)
    }).toThrow('@intRange can only be applied to integers or arrays of integers')
  })

  it('@floatRange(min: Int, max: Int) can be applied to Float, Float! or [Float] properties', () => {
    expect(() => {
      parseCompositeSchema(`
      type ModelWithIntProp @model(
        accountRelation: SINGLE,
        description: "Test model with incorrectly constrained int property"
      ) {
        intValue: Int @floatRange(max: 1)
      }
      `)
    }).toThrow('@floatRange can only be applied to floats or arrays of floats')
  })

  it('@length(min: Int, max: Int) can be applied to strings or arrays of strings', () => {
    expect(() => {
      parseCompositeSchema(`
      type ModelWithArrayProp @model(
        accountRelation: SINGLE,
        description: "Test model with incorrectly constrained array property"
      ) {
        intValue: [Int] @length(min:10, max: 140)
      }
      `)
    }).toThrow('@length can only be applied to strings or arrays of strings')
  })

  it('@arrayLength(min: Int, max: Int) can be applied to arrays', () => {
    expect(() => {
      parseCompositeSchema(`
      type ModelWithStringProp @model(
        accountRelation: SINGLE,
        description: "Test model with incorrectly constrained strings property"
      ) {
        intValue: String @arrayLength(max: 140)
      }
      `)
    }).toThrow('@arrayLength can only be applied to arrays')
  })

  it('@arrayLength(min: Int, max: Int) directive is supported for arrays and properly converted to ICD', () => {
    expect(
      parseCompositeSchema(`
      type ModelWithArrayProp @model(
        accountRelation: SINGLE,
        description: "Test model with a constrained array property"
      ) {
        arrayValue: [String] @length(max: 5) @arrayLength(min: 10, max: 15)
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithArrayProp',
          accountRelation: 'single',
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
      parseCompositeSchema(`
      type ModelWithArrayProp @model(
        accountRelation: SINGLE,
        description: "Test model with an array property with constrained items"
      ) {
        arrayValue: [String] @length(min: 4, max: 440) @arrayLength(max: 5)
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithArrayProp',
          accountRelation: 'single',
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
      parseCompositeSchema(`
      type ModelWithArrayPropWithoutArrayLengthDirective @model(
        accountRelation: SINGLE,
        description: "Test model with an array property without @arrayLength directive"
      ) {
        arrayValue: [Int]
      }
      `)
    }).toThrow('Missing @arrayLength directive')
  })

  it('@intRange(min: Int, max: Int) directive is supported and properly converted to ICD', () => {
    expect(
      parseCompositeSchema(`
      type ModelWithIntProp @model(
        accountRelation: SINGLE,
        description: "Test model with a constreained int property"
      ) {
        intValue: Int @intRange(min: 5, max: 10)
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithIntProp',
          accountRelation: 'single',
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
      parseCompositeSchema(`
      type ModelWithFloatProp @model(
        accountRelation: SINGLE,
        description: "Test model with a constrained float property"
      ) {
        floatValue: Float @floatRange(min: 5.0, max: 10.0)
      }
      `)
    ).toMatchObject({
      models: [
        {
          name: 'ModelWithFloatProp',
          accountRelation: 'single',
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
