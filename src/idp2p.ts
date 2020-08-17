import { ThreeIDDocument, getResolver } from '@ceramicnetwork/3id-did-resolver'
import { CeramicApi, DIDProvider, Doctype } from '@ceramicnetwork/ceramic-common'
import { DIDResolver, Resolver } from 'did-resolver'
import { DID } from 'dids'

import { Accessors, createAccessors } from './accessors'
import { IDX_DOCTYPE_CONFIGS, DoctypeProxy, IdxDoctypeName } from './doctypes'

type ResolverRegistry = Record<string, DIDResolver>

export interface Idp2pOptions {
  ceramic: CeramicApi
  resolverRegistry?: ResolverRegistry
}

export interface AuthenticateOptions {
  paths?: Array<string>
  provider?: DIDProvider
}

export class Idp2p {
  _ceramic: CeramicApi
  _docProxy: Record<string, DoctypeProxy<Doctype>> = {}
  _resolver: Resolver
  _rootDocId: string | undefined

  accounts: Accessors
  collections: Accessors
  profiles: Accessors

  constructor({ ceramic, resolverRegistry = {} }: Idp2pOptions) {
    this._ceramic = ceramic
    this._resolver = new Resolver({ ...resolverRegistry, ...getResolver(ceramic) })

    this.accounts = createAccessors('accounts', this)
    this.collections = createAccessors('collections', this)
    this.profiles = createAccessors('profiles', this)
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

  async authenticate(options: AuthenticateOptions = {}): Promise<void> {
    if (this._ceramic.user == null) {
      if (options.provider == null) {
        throw new Error('Not provider available')
      } else {
        await this._ceramic.setDIDProvider(options.provider)
      }
    }
  }

  async getUserDocument(): Promise<ThreeIDDocument | null> {
    return await this._resolver.resolve(this.user.DID)
  }

  async getIdxDocument(name: IdxDoctypeName): Promise<Doctype> {
    return await this._getProxy(name).get()
  }

  async changeIdxDocument<T = any>(name: IdxDoctypeName, change: (content: T) => T): Promise<void> {
    const mutation = async (doc: Doctype): Promise<Doctype> => {
      await doc.change({ content: change(doc.content) })
      return doc
    }
    return await this._getProxy(name).change(mutation)
  }

  _getProxy(name: IdxDoctypeName): DoctypeProxy<Doctype> {
    if (this._docProxy[name] == null) {
      const getRemote =
        name === 'root'
          ? (): Promise<Doctype> => this._getOrCreateRootDoc()
          : (): Promise<Doctype> => this._getOrCreateIdxDoc(name)
      this._docProxy[name] = new DoctypeProxy(getRemote)
    }
    return this._docProxy[name]
  }

  async _getOrCreateRootDoc(): Promise<Doctype> {
    const doc = await this._getRootDoc()
    return doc ?? (await this._createRootDoc())
  }

  async _getRootDoc(): Promise<Doctype | null> {
    if (this._rootDocId != null) {
      return await this._ceramic.loadDocument(this._rootDocId)
    }

    const userDoc = await this.getUserDocument()
    if (userDoc?.idx != null) {
      this._rootDocId = userDoc.idx
      return await this._ceramic.loadDocument(userDoc.idx)
    }

    return null
  }

  async _createRootDoc(content = {}): Promise<Doctype> {
    const config = IDX_DOCTYPE_CONFIGS.root
    const doctype = await this._ceramic.createDocument('tile', {
      content,
      metadata: {
        owners: [this.user.DID],
        schema: config.schema,
        tags: config.tags
      }
    })
    this._rootDocId = doctype.id
    return doctype
  }

  async _getOrCreateIdxDoc(name: IdxDoctypeName): Promise<Doctype> {
    const doc = await this._getIdxDoc(name)
    return doc ?? (await this._createIdxDoc(name))
  }

  async _getIdxDoc(name: IdxDoctypeName): Promise<Doctype | null> {
    const rootDoc = await this.getIdxDocument('root')
    const docId = rootDoc.content[name]
    return docId ? await this._ceramic.loadDocument(docId) : null
  }

  async _createIdxDoc(name: IdxDoctypeName, content = {}): Promise<Doctype> {
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
    await this.changeIdxDocument('root', content => ({ ...content, [name]: doctype.id }))

    return doctype
  }
}
