import { InternalCompositeDefinition, ModelDefinition } from "@glazed/types";

export const genericProfileDefinition: ModelDefinition = {
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
        $ref: '#/definitions/ImageSources',
      },
    },
    definitions: {
      ImageMetadata: {
        type: 'object',
        title: 'ImageMetadata',
        properties: {
          src: {
            type: 'string',
            pattern: '^ipfs://.+',
            maxLength: 150,
          },
          mimeType: {
            type: 'string',
            maxLength: 50,
          },
          width: {
            type: 'integer',
            minimum: 1,
          },
          height: {
            type: 'integer',
            minimum: 1,
          },
          size: {
            type: 'integer',
            minimum: 1,
          },
        },
        required: ['src', 'mimeType', 'width', 'height'],
      },
      ImageSources: {
        type: 'object',
        title: 'ImageSources',
        properties: {
          original: {
            $ref: '#/definitions/ImageMetadata',
          },
          alternatives: {
            type: 'array',
            items: {
              $ref: '#/definitions/ImageMetadata',
            },
          },
        },
        required: ['original'],
      },
    },
  }
}

export const socialProfileDefinition: ModelDefinition = {
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
        $ref: '#/definitions/ImageSources',
      },
      url: {
        type: 'string',
        maxLength: 240,
      },
    },
    definitions: {
      ImageMetadata: {
        type: 'object',
        title: 'ImageMetadata',
        properties: {
          src: {
            type: 'string',
            pattern: '^ipfs://.+',
            maxLength: 150,
          },
          mimeType: {
            type: 'string',
            maxLength: 50,
          },
          width: {
            type: 'integer',
            minimum: 1,
          },
          height: {
            type: 'integer',
            minimum: 1,
          },
          size: {
            type: 'integer',
            minimum: 1,
          },
        },
        required: ['src', 'mimeType', 'width', 'height'],
      },
      ImageSources: {
        type: 'object',
        title: 'ImageSources',
        properties: {
          original: {
            $ref: '#/definitions/ImageMetadata',
          },
          alternatives: {
            type: 'array',
            items: {
              $ref: '#/definitions/ImageMetadata',
            },
          },
        },
        required: ['original'],
      },
    },
  },
}

export const personProfileDefinition: ModelDefinition = {
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
}

export const compositeDefinitionWithProfiles: InternalCompositeDefinition = {
  version: '1.0',
  commonEmbeds: ['ImageSources', 'ImageMetadata'],
  models: {
    GenericProfileID: genericProfileDefinition,
    SocialProfileID: socialProfileDefinition,
    PersonProfileID: personProfileDefinition
  }
}