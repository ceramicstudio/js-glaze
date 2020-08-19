import { getResolver } from '@ceramicnetwork/3id-did-resolver'
import { CeramicApi, DIDProvider, Doctype } from '@ceramicnetwork/ceramic-common'
import DataLoader from 'dataloader'
import { Resolver } from 'did-resolver'
import { DID, ResolverOptions } from 'dids'

import { Accessors, createAccessors } from './accessors'
import { IDX_DOCTYPE_CONFIGS, DoctypeProxy, IDXDoctypeName } from './doctypes'
import { getIDXRoot } from './utils'

export interface IDXOptions {
  ceramic: CeramicApi
  resolver?: ResolverOptions
}

export interface AuthenticateOptions {
  paths?: Array<string>
  provider?: DIDProvider
}

export class IDX {
  _ceramic: CeramicApi
  _did2rootId: Record<string, string | null> = {}
  _docLoader: DataLoader<string, Doctype>
  _docProxy: Record<string, DoctypeProxy<Doctype>> = {}
  _resolver: Resolver

  accounts: Accessors
  collections: Accessors
  profiles: Accessors

  constructor({ ceramic, resolver = {} }: IDXOptions) {
    this._ceramic = ceramic
    this._docLoader = new DataLoader(async (docIds: ReadonlyArray<string>) => {
      return await Promise.all(docIds.map(async docId => await this._ceramic.loadDocument(docId)))
    })

    const ceramicResolver = getResolver(ceramic)
    const registry = resolver.registry
      ? { ...resolver.registry, ...ceramicResolver }
      : ceramicResolver
    this._resolver = new Resolver(registry, resolver.cache)

    this.accounts = createAccessors('accounts', this)
    this.collections = createAccessors('collections', this)
    this.profiles = createAccessors('profiles', this)
  }

  get authenticated(): boolean {
    return this._ceramic.user != null
  }

  get ceramic(): CeramicApi {
    return this._ceramic
  }

  get user(): DID {
    if (this._ceramic.user == null) {
      throw new Error('User is not authenticated')
    }
    return this._ceramic.user
  }

  get resolver(): Resolver {
    return this._resolver
  }

  async authenticate(options: AuthenticateOptions = {}): Promise<void> {
    if (this._ceramic.user == null) {
      if (options.provider == null) {
        throw new Error('Not provider available')
      } else {
        await this._ceramic.setDIDProvider(options.provider)
      }
    }
  }

  async loadCeramicDocument(docId: string): Promise<Doctype> {
    return await this._docLoader.load(docId)
  }

  async getRootDocument(did: string): Promise<Doctype | null> {
    let rootId = this._did2rootId[did]
    if (rootId === null) {
      return null
    }
    if (rootId == null) {
      const userDoc = await this._resolver.resolve(did)
      rootId = getIDXRoot(userDoc) ?? null
      this._did2rootId[did] = rootId
    }
    return rootId ? await this.loadCeramicDocument(rootId) : null
  }

  async getOwnDocument(name: IDXDoctypeName): Promise<Doctype> {
    return await this._getProxy(name).get()
  }

  async changeOwnDocument<T = any>(name: IDXDoctypeName, change: (content: T) => T): Promise<void> {
    const mutation = async (doc: Doctype): Promise<Doctype> => {
      await doc.change({ content: change(doc.content) })
      return doc
    }
    return await this._getProxy(name).change(mutation)
  }

  _getProxy(name: IDXDoctypeName): DoctypeProxy<Doctype> {
    if (this._docProxy[name] == null) {
      const getRemote =
        name === 'root'
          ? (): Promise<Doctype> => this._getOrCreateOwnRootDoc()
          : (): Promise<Doctype> => this._getOrCreateOwnDoc(name)
      this._docProxy[name] = new DoctypeProxy(getRemote)
    }
    return this._docProxy[name]
  }

  async _getOrCreateOwnRootDoc(): Promise<Doctype> {
    const doc = await this._getOwnRootDoc()
    return doc ?? (await this._createOwnRootDoc())
  }

  async _getOwnRootDoc(): Promise<Doctype | null> {
    return await this.getRootDocument(this.user.DID)
  }

  async _createOwnRootDoc(content = {}): Promise<Doctype> {
    const config = IDX_DOCTYPE_CONFIGS.root
    const doctype = await this._ceramic.createDocument('tile', {
      content,
      metadata: {
        owners: [this.user.DID],
        schema: config.schema,
        tags: config.tags
      }
    })
    this._did2rootId[this.user.DID] = doctype.id
    return doctype
  }

  async _getOrCreateOwnDoc(name: IDXDoctypeName): Promise<Doctype> {
    const doc = await this._getOwnDoc(name)
    return doc ?? (await this._createOwnDoc(name))
  }

  async _getOwnDoc(name: IDXDoctypeName): Promise<Doctype | null> {
    const rootDoc = await this.getOwnDocument('root')
    const docId = rootDoc.content[name]
    return docId ? await this.loadCeramicDocument(docId) : null
  }

  async _createOwnDoc(name: IDXDoctypeName, content = {}): Promise<Doctype> {
    const config = IDX_DOCTYPE_CONFIGS[name]
    if (config == null) {
      throw new Error(`Unsupported IDX name: ${name}`)
    }

    const doctype = await this._ceramic.createDocument('tile', {
      content,
      metadata: {
        owners: [this.user.DID],
        schema: config.schema,
        tags: config.tags
      }
    })
    await this.changeOwnDocument('root', content => ({ ...content, [name]: doctype.id }))

    return doctype
  }
}
