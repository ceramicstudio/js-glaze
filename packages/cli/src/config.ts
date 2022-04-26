import { join } from 'node:path'
import Conf from 'conf'
import type { Schema } from 'conf'
import getEnvPaths from 'env-paths'

export type ModelConfig = {
  source: 'local'
  path: string
}

export type UserConfig = {
  'ceramic-url': string
}

export type UserConfigKey = keyof UserConfig

export const DEFAULT_CERAMIC_URL = 'http://localhost:7007'

export const USER_CONFIG: Record<UserConfigKey, string> = {
  'ceramic-url': 'Ceramic API URL',
}

export type ConfigData = {
  models: Record<string, ModelConfig>
  user: UserConfig
}

export type Config = Conf<ConfigData>

export const MODEL_NAME_PATTERN = '^[a-zA-Z0-9_-]+$'

const SCHEMA: Schema<ConfigData> = {
  models: {
    type: 'object',
    patternProperties: {
      [MODEL_NAME_PATTERN]: {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            enum: ['local'],
          },
          path: {
            type: 'string',
          },
        },
      },
    },
  },
  user: {
    type: 'object',
    properties: {
      'ceramic-url': {
        type: 'string',
        format: 'uri',
      },
    },
    required: ['ceramic-url'],
  },
}

export const config = new Conf<ConfigData>({
  projectName: 'ceramic-glaze',
  defaults: {
    models: {},
    user: {
      'ceramic-url': DEFAULT_CERAMIC_URL,
    },
  },
  schema: SCHEMA,
})

export const envPaths = getEnvPaths('glaze-cli')

export const modelsPath = join(envPaths.data, 'models')

export function getLocalModelPath(name: string): string {
  return join(modelsPath, `${name}.json`)
}
