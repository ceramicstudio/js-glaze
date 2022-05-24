import { InternalCompositeDefinition, ModelDefinition } from "@glazed/types";

export const genericProfileDefinition: ModelDefinition = {
  name: 'GenericProfile',
  description: 'A model to store common profile-related properties',
  accountRelation: 'link',
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        maxLength: 150,
      },
      image: {
        $ref: '#/$defs/ImageSources',
      },
    },
    $defs: {
      ImageMetadata: {
        type: 'object',
        title: 'ImageMetadata',
        properties: {
          src: {
            type: 'string',
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
            $ref: '#/$defs/ImageMetadata',
          },
          alternatives: {
            type: 'array',
            items: {
              $ref: '#/$defs/ImageMetadata',
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
  description: 'A model to store properties that accounts would like to share on social media',
  accountRelation: 'link',
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
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
        $ref: '#/$defs/ImageSources',
      },
      url: {
        type: 'string',
        maxLength: 240,
      },
    },
    $defs: {
      ImageMetadata: {
        type: 'object',
        title: 'ImageMetadata',
        properties: {
          src: {
            type: 'string',
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
            $ref: '#/$defs/ImageMetadata',
          },
          alternatives: {
            type: 'array',
            items: {
              $ref: '#/$defs/ImageMetadata',
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
  description: `A model to store accounts' personal data`,
  accountRelation: 'link',
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      birthDate: {
        type: 'string',
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
        maxLength: 2,
      },
      nationalities: {
        type: 'array',
        minItems: 1,
        maxItems: 5,
        items: {
          type: 'string',
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