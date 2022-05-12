import { inspect } from 'util'

import { getResolver as get3IDResolver } from '@ceramicnetwork/3id-did-resolver'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { DataModel } from '@glazed/datamodel'
import { ModelManager } from '@glazed/devtools'
import { DIDDataStore } from '@glazed/did-datastore'
import type { ModelAliases } from '@glazed/types'
import { Command as CoreCommand, Flags } from '@oclif/core'
import chalk from 'chalk'
import { DID } from 'dids'
import type { ResolverRegistry } from 'did-resolver'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver as getKeyResolver } from 'key-did-resolver'
import ora from 'ora'
import type { Ora } from 'ora'
import { fromString } from 'uint8arrays'

import { config } from './config.js'
import { createDataModel, loadManagedModel } from './model.js'
import { SyncOptions } from '@ceramicnetwork/common'

type StringRecord = Record<string, unknown>

// TODO: SYNC_OPTIONS_MAP is also used in js-ceramic/packages/cli. Move this const to '@ceramicnetwork/common'
export const SYNC_OPTIONS_MAP: { [option: string]: SyncOptions | undefined } = {
  'prefer-cache': SyncOptions.PREFER_CACHE,
  'sync-always': SyncOptions.SYNC_ALWAYS,
  'never-sync': SyncOptions.NEVER_SYNC,
}

export interface CommandFlags {
  ceramic?: string
  key?: string
  [key: string]: unknown
}

export const STREAM_ID_ARG = {
  name: 'streamId',
  required: true,
  description: 'ID of the stream',
}

export const SYNC_OPTION_FLAG = Flags.integer({
  char: 's',
  required: false,
  options: Object.keys(SYNC_OPTIONS_MAP),
  description: `Controls if the current stream state should be synced over the network or not. 'prefer-cache' will return the state from the node's local cache if present, and will sync from the network if the stream isn't in the cache. 'always-sync' always syncs from the network, even if there is cached state for the stream. 'never-sync' never syncs from the network.`,
  parse: (input: string) => { return Promise.resolve(SYNC_OPTIONS_MAP[input] ?? SyncOptions.PREFER_CACHE) }
})

export abstract class Command<
  Flags extends CommandFlags = CommandFlags,
  Args extends StringRecord = StringRecord
> extends CoreCommand {
  static flags = {
    ceramic: Flags.string({ char: 'c', description: 'Ceramic API URL', env: 'CERAMIC_URL' }),
    key: Flags.string({ char: 'k', description: 'DID Private Key', env: 'DID_KEY' }),
  }

  #authenticatedDID: DID | null = null
  #ceramic: CeramicClient | null = null
  #resolverRegistry: ResolverRegistry | null = null

  args!: Args
  flags!: Flags
  spinner!: Ora

  async init(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore constructor type
    const { args, flags } = await this.parse(this.constructor)
    this.args = args as Args
    this.flags = flags as Flags
    this.spinner = ora()

    // Authenticate the Ceramic instance whenever a key is provided
    if (this.flags.key != null) {
      const did = await this.getAuthenticatedDID(this.flags.key)
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
        'DID is not authenticated, make sure to provide a seed using the "did-key" flag'
      )
    }
    return this.#authenticatedDID
  }

  get ceramic(): CeramicClient {
    if (this.#ceramic == null) {
      this.#ceramic = new CeramicClient(this.flags.ceramic ?? config.get('user')['ceramic-url'])
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

  async getDataModel(name: string): Promise<DataModel<ModelAliases>> {
    return await createDataModel(this.ceramic, name)
  }

  getDataStore<ModelTypes extends ModelAliases = ModelAliases>(
    model: DataModel<ModelTypes>
  ): DIDDataStore<ModelTypes> {
    return new DIDDataStore({ ceramic: this.ceramic, model })
  }

  async getModelManager(name: string): Promise<ModelManager> {
    const model = await loadManagedModel(name)
    return ModelManager.fromJSON({ ceramic: this.ceramic, model })
  }

  logJSON(data: unknown): void {
    this.log(inspect(data, { colors: true, depth: null }))
  }
}
