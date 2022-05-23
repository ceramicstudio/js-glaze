/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { createRuntimeDefinition, getName } from '../src'

describe('Runtime format', () => {
  describe('getName()', () => {
    test('converts input to pascal case', () => {
      expect(getName('Foo bar')).toBe('FooBar')
      expect(getName('foo_bar')).toBe('FooBar')
      expect(getName('Foo-bar')).toBe('FooBar')
    })

    test('adds the prefix', () => {
      expect(getName('bar', 'Foo')).toBe('FooBar')
      expect(getName('foo_bar', 'Bar')).toBe('BarFooBar')
    })

    test('ignores the prefix if already included', () => {
      expect(getName('foo_bar', 'Foo')).toBe('FooBar')
    })
  })

  test('Profile - multiples models with common local references', () => {
    const runtime = createRuntimeDefinition({
      version: '1.0',
      commonEmbeds: ['ImageMetadata', 'ImageSources'],
      models: {
        genericProfileID: {
          name: 'GenericProfile',
          accountRelation: 'link',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              name: {
                type: 'string',
                maxLength: 150,
              },
              image: {
                $ref: '#/$defs/imageSources',
              },
            },
            $defs: {
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
                    $ref: '#/$defs/IPFSURL',
                  },
                  mimeType: {
                    type: 'string',
                    maxLength: 50,
                  },
                  width: {
                    $ref: '#/$defs/positiveInteger',
                  },
                  height: {
                    $ref: '#/$defs/positiveInteger',
                  },
                  size: {
                    $ref: '#/$defs/positiveInteger',
                  },
                },
                required: ['src', 'mimeType', 'width', 'height'],
              },
              imageSources: {
                type: 'object',
                title: 'ImageSources',
                properties: {
                  original: {
                    $ref: '#/$defs/imageMetadata',
                  },
                  alternatives: {
                    type: 'array',
                    items: {
                      $ref: '#/$defs/imageMetadata',
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
          accountRelation: 'link',
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
                $ref: '#/$defs/imageSources',
              },
              url: {
                type: 'string',
                maxLength: 240,
              },
            },
            $defs: {
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
                    $ref: '#/$defs/IPFSURL',
                  },
                  mimeType: {
                    type: 'string',
                    maxLength: 50,
                  },
                  width: {
                    $ref: '#/$defs/positiveInteger',
                  },
                  height: {
                    $ref: '#/$defs/positiveInteger',
                  },
                  size: {
                    $ref: '#/$defs/positiveInteger',
                  },
                },
                required: ['src', 'mimeType', 'width', 'height'],
              },
              imageSources: {
                type: 'object',
                title: 'ImageSources',
                properties: {
                  original: {
                    $ref: '#/$defs/imageMetadata',
                  },
                  alternatives: {
                    type: 'array',
                    items: {
                      $ref: '#/$defs/imageMetadata',
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
          accountRelation: 'link',
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
    expect(runtime).toMatchSnapshot()
  })
})
