import { inspect } from 'util'

import ThreeIDResolver from '@ceramicnetwork/3id-did-resolver'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { DataModel } from '@glazed/datamodel'
import { ModelManager } from '@glazed/devtools'
import { DIDDataStore } from '@glazed/did-datastore'
import type { PublishedModel } from '@glazed/types'
import { Command as Cmd, flags } from '@oclif/command'
import chalk from 'chalk'
import { DID } from 'dids'
import type { ResolverRegistry } from 'did-resolver'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import KeyResolver from 'key-did-resolver'
import ora from 'ora'
import type { Ora } from 'ora'
import { fromString } from 'uint8arrays'

import { config } from './config'
import { createDataModel, loadManagedModel } from './model'

type StringRecord = Record<string, unknown>

export interface CommandFlags {
  ceramic?: string
  key?: string
  [key: string]: unknown
}

export abstract class Command<
  Flags extends CommandFlags = CommandFlags,
  Args extends StringRecord = StringRecord
> extends Cmd {
  static flags = {
    ceramic: flags.string({ char: 'c', description: 'Ceramic API URL', env: 'CERAMIC_URL' }),
    key: flags.string({ char: 'k', description: 'Private DID Key', env: 'DID_KEY' }),
  }

  #authenticatedDID: DID | null = null
  #ceramic: CeramicClient | null = null
  #resolverRegistry: ResolverRegistry | null = null

  args!: Args
  flags!: Flags
  spinner!: Ora

  async init(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { args, flags } = this.parse(this.constructor)
    this.args = args as Args
    this.flags = flags as Flags
    this.spinner = ora({ stream: process.stdout })

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
      const keyResolver = KeyResolver.getResolver()
      const threeIDResolver = ThreeIDResolver.getResolver(this.ceramic)
      this.#resolverRegistry = { ...keyResolver, ...threeIDResolver }
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

  async getDataModel(name: string): Promise<DataModel<PublishedModel>> {
    return await createDataModel(this.ceramic, name)
  }

  getDataStore<ModelTypes extends PublishedModel = PublishedModel>(
    model: DataModel<ModelTypes>
  ): DIDDataStore<ModelTypes> {
    return new DIDDataStore({ autopin: true, ceramic: this.ceramic, model })
  }

  async getModelManager(name: string): Promise<ModelManager> {
    const model = await loadManagedModel(name)
    return ModelManager.fromJSON(this.ceramic, model)
  }

  logJSON(data: unknown): void {
    this.log(inspect(data, { colors: true, depth: null }))
  }
}
