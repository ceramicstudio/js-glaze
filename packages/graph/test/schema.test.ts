import { createRuntimeDefinition } from '@glazed/devtools'

import { printGraphQLSchema } from '../src'

describe('schema', () => {
  test('printGraphQLSchema()', () => {
    const definition = createRuntimeDefinition({
      version: '1.0',
      commonEmbeds: ['ImageMetadata', 'ImageSources'],
      models: {
        genericProfileID: {
          name: 'GenericProfile',
          accountRelation: 'single',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              name: {
                type: 'string',
                maxLength: 150,
              },
              image: {
                $ref: '#/definitions/imageSources',
              },
            },
            definitions: {
              IPFSURL: {
                type: 'string',
                pattern: '^ipfs://.+',
                maxLength: 150,
              },
              positiveInteger: {
                type: 'integer',
                minimum: 1,
              },
              imageMetadata: {
                type: 'object',
                title: 'ImageMetadata',
                properties: {
                  src: {
                    $ref: '#/definitions/IPFSURL',
                  },
                  mimeType: {
                    type: 'string',
                    maxLength: 50,
                  },
                  width: {
                    $ref: '#/definitions/positiveInteger',
                  },
                  height: {
                    $ref: '#/definitions/positiveInteger',
                  },
                  size: {
                    $ref: '#/definitions/positiveInteger',
                  },
                },
                required: ['src', 'mimeType', 'width', 'height'],
              },
              imageSources: {
                type: 'object',
                title: 'ImageSources',
                properties: {
                  original: {
                    $ref: '#/definitions/imageMetadata',
                  },
                  alternatives: {
                    type: 'array',
                    items: {
                      $ref: '#/definitions/imageMetadata',
                    },
                  },
                },
                required: ['original'],
              },
            },
          },
        },
        socialProfileID: {
          name: 'SocialProfile',
          accountRelation: 'single',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              description: {
                type: 'string',
                maxLength: 420,
              },
              emoji: {
                type: 'string',
                maxLength: 2,
              },
              background: {
                $ref: '#/definitions/imageSources',
              },
              url: {
                type: 'string',
                maxLength: 240,
              },
            },
            definitions: {
              IPFSURL: {
                type: 'string',
                pattern: '^ipfs://.+',
                maxLength: 150,
              },
              positiveInteger: {
                type: 'integer',
                minimum: 1,
              },
              imageMetadata: {
                type: 'object',
                title: 'ImageMetadata',
                properties: {
                  src: {
                    $ref: '#/definitions/IPFSURL',
                  },
                  mimeType: {
                    type: 'string',
                    maxLength: 50,
                  },
                  width: {
                    $ref: '#/definitions/positiveInteger',
                  },
                  height: {
                    $ref: '#/definitions/positiveInteger',
                  },
                  size: {
                    $ref: '#/definitions/positiveInteger',
                  },
                },
                required: ['src', 'mimeType', 'width', 'height'],
              },
              imageSources: {
                type: 'object',
                title: 'ImageSources',
                properties: {
                  original: {
                    $ref: '#/definitions/imageMetadata',
                  },
                  alternatives: {
                    type: 'array',
                    items: {
                      $ref: '#/definitions/imageMetadata',
                    },
                  },
                },
                required: ['original'],
              },
            },
          },
        },
        personProfileID: {
          name: 'PersonProfile',
          accountRelation: 'single',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              birthDate: {
                type: 'string',
                format: 'date',
                maxLength: 10,
              },
              gender: {
                type: 'string',
                maxLength: 42,
              },
              homeLocation: {
                type: 'string',
                maxLength: 140,
              },
              residenceCountry: {
                type: 'string',
                pattern: '^[A-Z]{2}$',
                maxLength: 2,
              },
              nationalities: {
                type: 'array',
                minItems: 1,
                items: {
                  type: 'string',
                  pattern: '^[A-Z]{2}$',
                  maxItems: 5,
                },
              },
              affiliations: {
                type: 'array',
                items: {
                  type: 'string',
                  maxLength: 140,
                },
              },
            },
          },
        },
      },
    })
    expect(printGraphQLSchema(definition)).toMatchSnapshot()
  })
})
