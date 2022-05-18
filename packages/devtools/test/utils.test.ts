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

  it('@intValue(min: Int, max: Int) directive is supported and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithIntProp @model(index: LINK) {
        intValue: Int @intValue(min: 5, max: 10)
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

  it('@floatValue(min: Float, max: Float) directive is supported and properly converted to ICD', () => {
    expect(
      internalCompositeDefinitionFromGraphQLSchema(`
      type ModelWithFloatProp @model(index: LINK) {
        floatValue: Float @floatValue(min: 5.0, max: 10.0)
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
                type: 'float',
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
