/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { applyMap, promiseMap, compositeDefinitionFromSchema } from '../src'
import {
  buildSchema,
  GraphQLSchema,
  graphqlSync,
  IntrospectionQuery,
  getIntrospectionQuery,
} from 'graphql'
import { fromIntrospectionQuery } from 'graphql-2-json-schema';

describe('utils', () => {
  // it('applyMap applies the given function to all values in a record', () => {
  //   const res = applyMap({ one: 1, two: 2 }, (v) => v * 2)
  //   expect(res).toEqual({ one: 2, two: 4 })
  // })

  // it('promiseMap applies the given async function to all values in a record', async () => {
  //   const res = await promiseMap({ one: 1, two: 2 }, (v) => Promise.resolve(v * 2))
  //   expect(res).toEqual({ one: 2, two: 4 })
  // })

  // it('compositeDefinitionFromSchema throws when there\'s no top-level model object', () => {
  //   expect(() => {
  //     compositeDefinitionFromSchema(`
  //     scalar PositiveInt
  //     scalar URL

  //     type ImageMetadata {
  //       src: URL! @ipfs
  //       mimeType: String! @length(max: 50)
  //       width: PositiveInt!
  //       height: PositiveInt!
  //       size: PositiveInt
  //     }
  //     `)
  //   }).toThrow("No models found in Composite Definition Schema")
  // })

  // it('compositeDefinitionFromSchema supports @model, @length and @ips', () => {
  //   const compositeDefinition = compositeDefinitionFromSchema(`
  //   type Profile @model(index: LINK) {
  //     name: String @length(max: 150)
  //     profilePicture: String @ipfs
  //   }
  //   `)
  //   expect(compositeDefinition).toMatchObject(
  //     {
  //       "version":"1.0",
  //       "models": 
  //         {"Profile":
  //           {
  //             "name":"Profile",
  //             "accountRelation":"link",
  //             "schema":{
  //               "name":{
  //                 "type":"string",
  //                 "title":"name",
  //                 "maxLength":150,
  //                 "minLength":0
  //               },
  //               "profilePicture":{
  //                 "type":"string",
  //                 "title":"profilePicture",
  //                 "pattern":"^ipfs://.+"
  //               }
  //             }
  //           }
  //         }
  //       }
  //   )
  // })

  // it('compositeDefinitionFromSchema supports chained directives', () => {
  //   const compositeDefinition = compositeDefinitionFromSchema(`
  //   type Profile @model(index: LINK) {
  //     profilePicture: String @ipfs @length(max: 150, min: 40)
  //   }
  //   `)
  //   expect(compositeDefinition).toMatchObject(
  //     {
  //       "version":"1.0",
  //       "models": 
  //         {"Profile":
  //           {
  //             "name":"Profile",
  //             "accountRelation":"link",
  //             "schema":{
  //               "profilePicture":{
  //                 "type":"string",
  //                 "title":"profilePicture",
  //                 "pattern":"^ipfs://.+",
  //                 "maxLength":150,
  //                 "minLength":40
  //               }
  //             }
  //           }
  //         }
  //     }
  //   )
  // })

  // it('compositeDefinitionFromSchema supports nested objects that are not models', () => {
  //   const compositeDefinition = compositeDefinitionFromSchema(`
  //   scalar PositiveInt
  //   scalar URL
  
  //   type ImageMetadata {
  //     src: URL! @ipfs
  //     mimeType: String! @length(max: 50)
  //     width: PositiveInt!
  //     height: PositiveInt!
  //     size: PositiveInt
  //   }
  
  //   type ImageSources {
  //     original: ImageMetadata!
  //     alternatives: [ImageMetadata]
  //   }
  
  //   type SocialProfile @model(index: LINK) {
  //     description: String @length(max: 150)
  //     emoji: String @length(max: 2)
  //     background: ImageSources
  //     url: URL @length(max: 240)
  //   }
  //   `)
  //   expect(compositeDefinition).toMatchObject(
  //     {
  //       "version":"1.0",
  //       "models": 
  //         {
  //           "SocialProfile":{
  //             "name":"SocialProfile",
  //             "accountRelation":"link",
  //             "schema":{
  //               "description":{
  //                 "type":"string",
  //                 "title":"description",
  //                 "maxLength":150
  //               },
  //               "emoji":{
  //                 "type":"string",
  //                 "title":"emoji",
  //                 "maxLength":2
  //               },
  //               "background": {
  //                 "type": "ImageSources",
  //                 "title": "background"
  //               },
  //               "url":{
  //                 "type":"string",
  //                 "pattern":"^[http|https]://.+",
  //                 "title":"url",
  //                 "maxLength":240
  //               }
  //             },
  //           },
  //           "#definitions":{
  //             "ImageSources": {
  //               "original": {
  //                 "type": "imageMetadata!",
  //                 "title": "original"
  //               },
  //               "alternatives": {
  //                 "type": "[imageMetadata]",
  //                 "title": "alternatives"
  //               }
  //             },
  //             "ImageMetadata": {
  //               "src": {
  //                 "type": "string",
  //                 "pattern":"^ipfs://.+",
  //                 "title": "src"
  //               },
  //               "mimeType": {
  //                 "type": "string",
  //                 "maxLength":50,
  //                 "title": "mimeType"
  //               },
  //               "width": {
  //                 "type": "positiveInt!",
  //                 "title": "width"
  //               },
  //               "height": {
  //                 "type": "positiveInt!",
  //                 "title": "height"
  //               },
  //               "size": {
  //                 "type": "positiveInt",
  //                 "title": "size"
  //               }
  //             }
  //           },
  //         }
  //     }
  //   )
  // })
  it('tests graphql to json schema', () => {
    const schema = buildSchema(`
        "A ToDo Object"
        type Todo implements Node {
            "A unique identifier"
            id: String!
            name: String!
            completed: Boolean
            color: Color

            "A required list containing colors that cannot contain nulls"
            requiredColors: [Color!]!

            "A non-required list containing colors that cannot contain nulls"
            optionalColors: [Color!]

            fieldWithOptionalArgument(
              optionalFilter: [String!]
            ): [String!]

            fieldWithRequiredArgument(
              requiredFilter: [String!]!
            ): [String!]

            nullableFieldThatReturnsListOfNonNullStrings(
              nonRequiredArgumentOfNullableStrings: [String]
              nonRequiredArgumentOfNonNullableStrings: [String!]
              requiredArgumentOfNullableStrings: [String]!
              requiredArgumentOfNonNullableStrings: [String!]!
            ): [String!]

            nullableFieldThatReturnsListOfNullableStrings: [String]
        }

        "A simpler ToDo Object"
        type SimpleTodo {
          id: String!
          name: String!
        }

        "A Union of Todo and SimpleTodo"
        union TodoUnion = Todo | SimpleTodo

        enum Color {
          "Red color"
          RED
          "Green color"
          GREEN
        }

        """
        A type that describes ToDoInputType. Its description might not
        fit within the bounds of 80 width and so you want MULTILINE
        """
        input TodoInputType {
          name: String!
          completed: Boolean
          color: Color=RED
          contactInfo: ContactInfoInputType = {
            email: "spam@example.dev"
          }
        }

        """
        Description of ContactInfoInputType.
        """
        input ContactInfoInputType {
          email: String
        }

        "Anything with an ID can be a node"
        interface Node {
          "A unique identifier"
          id: String!
        }

        type Query {
            todo(
                "todo identifier"
                id: String!
                isCompleted: Boolean=false
                requiredNonNullStrings: [String!]!
                optionalNonNullStrings: [String!]

                requiredNullableStrings: [String]!
                optionalNullableStringsWithDefault: [String]=["foo"]

                color: Color
                requiredColor: Color!
                requiredColorWithDefault: Color! = RED

                colors: [Color]
                requiredColors: [Color]!
                requiredColorsNonNullable: [Color!]!
                requiredColorsWithDefault: [Color]! = [GREEN, RED]
                requiredColorsNonNullableWithDefault: [Color!]! = [GREEN, RED]
            ): Todo!
            todos: [Todo!]!
            todoUnions: [TodoUnion]
            node(
              "Node identifier"
              id: String!
            ): Node
        }

        type Mutation {
            update_todo(id: String!, todo: TodoInputType!): Todo
            create_todo(todo: TodoInputType!): Todo
            create_todo_union(id: String!): TodoUnion
        }
    `)
    
    const executionResult = graphqlSync({
      schema: schema,
      source: getIntrospectionQuery()
    })

    const introspection = {
      // @ts-ignore
      introspection: executionResult.data as IntrospectionQuery,
      schema: schema,
    }

    // @ts-ignore
    const result = fromIntrospectionQuery(introspection)

    console.log("result", result)
    expect(result).toBeDefined()
  })
})
