import { inspect } from 'util'

import { SyncOptions } from '@ceramicnetwork/common'
import { getResolver as get3IDResolver } from '@ceramicnetwork/3id-did-resolver'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { Command as CoreCommand, Flags } from '@oclif/core'
import chalk from 'chalk'
import { DID } from 'dids'
import type { ResolverRegistry } from 'did-resolver'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver as getKeyResolver } from 'key-did-resolver'
import ora from 'ora'
import type { Ora } from 'ora'
import { fromString } from 'uint8arrays'

type StringRecord = Record<string, unknown>

// TODO: SYNC_OPTIONS_MAP is also used in js-ceramic/packages/cli. Move this const to '@ceramicnetwork/common'
export const SYNC_OPTIONS_MAP: Record<string, SyncOptions | undefined> = {
  'prefer-cache': SyncOptions.PREFER_CACHE,
  'sync-always': SyncOptions.SYNC_ALWAYS,
  'never-sync': SyncOptions.NEVER_SYNC,
}

export interface CommandFlags {
  'ceramic-url': string
  'did-key-seed': string
  [key: string]: unknown
}

export type QueryCommandFlags = CommandFlags & {
  sync?: SyncOptions
}

export const STREAM_ID_ARG = {
  name: 'streamId',
  required: true,
  description: 'ID of the stream',
}

export const SYNC_OPTION_FLAG = Flags.integer({
  required: false,
  options: Object.keys(SYNC_OPTIONS_MAP),
  description: `Controls if the current stream state should be synced over the network or not. 'prefer-cache' will return the state from the node's local cache if present, and will sync from the network if the stream isn't in the cache. 'always-sync' always syncs from the network, even if there is cached state for the stream. 'never-sync' never syncs from the network.`,
  parse: (input: string) => {
    return Promise.resolve(SYNC_OPTIONS_MAP[input] ?? SyncOptions.PREFER_CACHE)
  },
})

const readPipe: () => Promise<string | undefined> = () => {
  return new Promise((resolve) => {
    let data = ''
    const stdin = process.openStdin()
    const finish = () => {
      resolve(data.trim())
      stdin.pause()
    }

    stdin.setEncoding('utf-8')
    stdin.on('data', (chunk) => {
      data += chunk
    })

    stdin.on('end', () => {
      finish()
    })

    if (stdin.isTTY) {
      finish()
    }
  })
}

export abstract class Command<
  Flags extends CommandFlags = CommandFlags,
  Args extends StringRecord = StringRecord
> extends CoreCommand {
  static flags = {
    'ceramic-url': Flags.string({
      char: 'c',
      description: 'Ceramic API URL',
      env: 'CERAMIC_URL',
    }),
    'did-key-seed': Flags.string({ char: 's', description: 'DID key seed', env: 'DID_KEY_SEED' }),
  }

  #authenticatedDID: DID | null = null
  #ceramic: CeramicClient | null = null
  #resolverRegistry: ResolverRegistry | null = null

  args!: Args
  flags!: Flags
  stdin!: string | undefined
  spinner!: Ora

  async init(): Promise<void> {
    this.stdin = await readPipe()
    if (this.stdin) {
      this.argv = [this.stdin].concat(this.argv)
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore constructor type
    const { args, flags } = await this.parse(this.constructor)
    this.args = args as Args
    this.flags = flags as Flags
    this.spinner = ora()
    // Authenticate the Ceramic instance whenever a key is provided
    if (this.flags['did-key-seed'] != null) {
      const did = await this.getAuthenticatedDID(this.flags['did-key-seed'])
      this.spinner.info(`Using DID ${chalk.cyan(did.id)}`)
      this.#authenticatedDID = did
      this.ceramic.did = did
    }
  }

  async finally(): Promise<void> {
    if (this.#ceramic != null) {
      await this.#ceramic.close()
    }
  }

  get authenticatedDID(): DID {
    if (this.#authenticatedDID == null) {
      throw new Error(
        'DID is not authenticated, make sure to provide a seed using the "did-key-seed" flag'
      )
    }
    return this.#authenticatedDID
  }

  get ceramic(): CeramicClient {
    if (this.#ceramic == null) {
      this.#ceramic = new CeramicClient(this.flags['ceramic-url'])
    }
    return this.#ceramic
  }

  get resolverRegistry(): ResolverRegistry {
    if (this.#resolverRegistry == null) {
      this.#resolverRegistry = { ...getKeyResolver(), ...get3IDResolver(this.ceramic) }
    }
    return this.#resolverRegistry
  }

  getProvider(seed: string): Ed25519Provider {
    return new Ed25519Provider(fromString(seed, 'base16'))
  }

  getDID(): DID {
    return new DID({ resolver: this.resolverRegistry })
  }

  async getAuthenticatedDID(seed: string): Promise<DID> {
    const did = this.getDID()
    did.setProvider(this.getProvider(seed))
    await did.authenticate()
    return did
  }

  logJSON(data: unknown): void {
    this.log(inspect(data, { colors: true, depth: null }))
  }
}
