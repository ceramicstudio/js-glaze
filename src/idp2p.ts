import { Doctype } from '@ceramicnetwork/ceramic-common'
import { DID } from 'dids'

import { Accessors, createAccessors } from './accessors'
import { IDX_DOCTYPE_CONFIGS, IdxDoctypeName } from './doctypes'
import { AuthProvider, NewCeramicApi } from './types'

export interface Idp2pOptions {
  ceramic: NewCeramicApi
}

export interface AuthenticateOptions {
  paths?: Array<string>
  provider?: AuthProvider
}

export class Idp2p {
  _ceramic: NewCeramicApi
  _docQueue: Record<string, Promise<Doctype>> = {}
  _rootDocId: string | undefined

  accounts: Accessors
  profiles: Accessors

  constructor({ ceramic }: Idp2pOptions) {
    this._ceramic = ceramic
    this.accounts = createAccessors('accounts', this)
    this.profiles = createAccessors('profiles', this)
  }

  get ceramic(): NewCeramicApi {
    return this._ceramic
  }

  get user(): DID {
    if (this._ceramic.user == null) {
      throw new Error('User is not authenticated')
    }
    return this._ceramic.user
  }

  async authenticate(options: AuthenticateOptions = {}): Promise<void> {
    let provider = this._ceramic.getDIDProvider()
    if (provider == null) {
      if (options.provider == null) {
        throw new Error('Not provider available')
      } else {
        // Use provider and attach it to Ceramic instance
        provider = options.provider
        this._ceramic.setDIDProvider(provider)
      }
    } else if (options.provider != null && options.provider !== provider) {
      throw new Error('A different provider is already attached to the Ceramic instance')
    }

    let user = this._ceramic.user
    if (user == null) {
      // @ts-ignore: provider type
      user = new DID(provider)
      this._ceramic.setUser(user)
    }

    await user.authenticate()
  }

  async getUserDocument(): Promise<Doctype> {
    const cid = this.user.DID.split(':')[2]
    return await this._ceramic.loadDocument(`ceramic://${cid}`)
  }

  async getIdxDocument(name: IdxDoctypeName): Promise<Doctype> {
    const existing = this._docQueue[name]
    if (existing != null) {
      return await existing
    }

    const getOrCreate = name === 'root' ? this._getOrCreateRootDoc() : this._getOrCreateIdxDoc(name)
    this._docQueue[name] = getOrCreate
    getOrCreate.catch(() => {
      delete this._docQueue[name]
    })

    return await getOrCreate
  }

  async changeIdxDocument<T = any>(name: IdxDoctypeName, change: (content: T) => T): Promise<void> {
    const queue = this.getIdxDocument(name).then(doc => {
      return doc.change({ content: change(doc.content) }).then(() => doc)
    })
    this._docQueue[name] = queue
    await queue
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
    if (userDoc.content.idx != null) {
      this._rootDocId = userDoc.content.idx
      return await this._ceramic.loadDocument(userDoc.content.idx)
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

    const userDoc = await this.getUserDocument()
    await userDoc.change({
      content: { ...userDoc.content, idx: doctype.id },
      metadata: userDoc.metadata
    })

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
