import { randomBytes } from 'crypto'

import Conf from 'conf'
import type { Schema } from 'conf'
import { getPassword, setPassword } from 'keytar'

const KEY_SERVICE = 'ceramic.idx'
const KEY_ACCOUNT = 'config'

export type DIDConfig = {
  createdAt: string // datetime
  label?: string
  seed: string // 0x-prefixed hex
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
  dids: Record<string, DIDConfig> // DID string to hex-encoded seed
  user: UserConfig
}

export type Config = Conf<ConfigData>

const SCHEMA: Schema<ConfigData> = {
  dids: {
    type: 'object',
    propertyNames: {
      pattern: '^did:(3|key):[0-9A-Za-z]+$',
    },
    additionalProperties: {
      type: 'object',
      properties: {
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        label: {
          type: 'string',
        },
        seed: {
          type: 'string',
          pattern: '^[0-9a-f]{64}$',
        },
      },
      required: ['createdAt', 'seed'],
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

async function getKey(): Promise<string> {
  const existing = await getPassword(KEY_SERVICE, KEY_ACCOUNT)
  if (existing != null) {
    return existing
  }

  const key = randomBytes(32).toString('hex')
  await setPassword(KEY_SERVICE, KEY_ACCOUNT, key)
  return key
}

async function createConfig(): Promise<Config> {
  return new Conf<ConfigData>({
    defaults: {
      dids: {},
      user: {
        'ceramic-url': DEFAULT_CERAMIC_URL,
      },
    },
    encryptionKey: await getKey(),
    schema: SCHEMA,
  })
}

let configPromise: Promise<Config> | null = null

export async function getConfig(): Promise<Config> {
  if (configPromise == null) {
    configPromise = createConfig()
  }
  return await configPromise
}

export async function getDID(did: string): Promise<[string, DIDConfig] | void> {
  const cfg = await getConfig()
  const dids = cfg.get('dids')

  if (did.startsWith('did:')) {
    return [did, dids[did]]
  }

  for (const [key, value] of Object.entries(dids)) {
    if (value.label === did) {
      return [key, value]
    }
  }
}

export async function getPublicDID(did: string): Promise<string | void> {
  if (did.startsWith('did:')) {
    return did
  }
  const found = await getDID(did)
  if (found) {
    return found[0]
  }
}
