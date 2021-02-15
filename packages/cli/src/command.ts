import { inspect } from 'util'

import ThreeIDResolver from '@ceramicnetwork/3id-did-resolver'
import Ceramic from '@ceramicnetwork/http-client'
import KeyResolver from '@ceramicnetwork/key-did-resolver'
import { IDX } from '@ceramicstudio/idx'
import { definitions } from '@ceramicstudio/idx-constants'
import type { DefinitionName } from '@ceramicstudio/idx-constants'
import type { Definition } from '@ceramicstudio/idx-tools'
import { Command as Cmd, flags } from '@oclif/command'
import { DID } from 'dids'
import type { ResolverRegistry } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import ora from 'ora'
import type { Ora } from 'ora'
import { fromString } from 'uint8arrays'

import { getDID, getConfig } from './config'
import type { Config } from './config'

type StringRecord = Record<string, unknown>

export interface CommandFlags {
  ceramic?: string
  [key: string]: unknown
}

export abstract class Command<
  Flags extends CommandFlags = CommandFlags,
  Args extends StringRecord = StringRecord
> extends Cmd {
  static flags = {
    ceramic: flags.string({ char: 'c', description: 'Ceramic API URL', env: 'CERAMIC_URL' }),
  }

  _ceramic: Ceramic | null = null
  _idx: IDX | null = null
  _resolverRegistry: ResolverRegistry | null = null
  args!: Args
  flags!: Flags
  spinner!: Ora

  init(): Promise<void> {
    // @ts-ignore
    const { args, flags } = this.parse(this.constructor)
    this.args = args as Args
    this.flags = flags as Flags
    this.spinner = ora()
    return Promise.resolve()
  }

  async finally(): Promise<void> {
    if (this._ceramic != null) {
      await this._ceramic.close()
    }
  }

  async getConfig(): Promise<Config> {
    return await getConfig()
  }

  async getResolverRegistry(): Promise<ResolverRegistry> {
    if (this._resolverRegistry == null) {
      const ceramic = await this.getCeramic()
      const keyResolver = KeyResolver.getResolver()
      const threeIDResolver = ThreeIDResolver.getResolver(ceramic)
      this._resolverRegistry = { ...keyResolver, ...threeIDResolver }
    }
    return this._resolverRegistry
  }

  async getDID(id?: string): Promise<DID> {
    if (id == null) {
      return new DID({ resolver: await this.getResolverRegistry() })
    }

    const [provider, resolver] = await Promise.all([
      this.getProvider(id),
      this.getResolverRegistry(),
    ])
    const did = new DID({ provider, resolver })
    await did.authenticate()
    return did
  }

  async getCeramic(): Promise<Ceramic> {
    if (this._ceramic == null) {
      let url = this.flags.ceramic
      if (url == null) {
        const cfg = await getConfig()
        url = cfg.get('user')['ceramic-url']
      }
      this._ceramic = new Ceramic(url)
    }
    return this._ceramic
  }

  async getAuthenticatedCeramic(id: string): Promise<Ceramic> {
    const [ceramic, provider] = await Promise.all([this.getCeramic(), this.getProvider(id)])
    await ceramic.setDIDProvider(provider)
    return ceramic
  }

  async getIDX(did?: string): Promise<IDX> {
    if (this._idx == null) {
      const ceramic = did ? await this.getAuthenticatedCeramic(did) : await this.getCeramic()
      this._idx = new IDX({ ceramic })
    }
    return this._idx
  }

  async getDefinition(name: string): Promise<Definition> {
    const idx = await this.getIDX()
    return await idx.getDefinition(definitions[name as DefinitionName] ?? name)
  }

  async getProvider(id: string): Promise<Ed25519Provider> {
    const found = await getDID(id)
    if (found == null) {
      throw new Error('Could not load DID from local store')
    }
    return new Ed25519Provider(fromString(found[1].seed, 'base16'))
  }

  logJSON(data: unknown): void {
    this.log(inspect(data, { colors: true, depth: null }))
  }
}
