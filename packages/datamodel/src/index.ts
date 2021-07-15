import type { CeramicApi } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { ModelTypeAliases, ModelTypesToAliases } from '@glazed/types'

export type CreateOptions = {
  pin?: boolean
}

export type DataModelParams<Model> = {
  autopin?: boolean
  ceramic: CeramicApi
  model: Model
}

export class DataModel<
  ModelTypes extends ModelTypeAliases,
  ModelAliases extends ModelTypesToAliases<ModelTypes> = ModelTypesToAliases<ModelTypes>
> {
  _autopin: boolean
  _ceramic: CeramicApi
  _model: ModelAliases

  constructor({ autopin, ceramic, model }: DataModelParams<ModelAliases>) {
    this._autopin = autopin !== false
    this._ceramic = ceramic
    this._model = model
  }

  get ceramic(): CeramicApi {
    return this._ceramic
  }

  getDefinitionID<Alias extends keyof ModelAliases['definitions']>(alias: Alias): string | null {
    return this._model.definitions[alias] ?? null
  }

  getSchemaURL<Alias extends keyof ModelAliases['schemas']>(alias: Alias): string | null {
    return this._model.schemas[alias] ?? null
  }

  getTileID<Alias extends keyof ModelAliases['tiles']>(alias: Alias): string | null {
    return this._model.tiles[alias] ?? null
  }

  async loadTile<
    Alias extends keyof ModelAliases['tiles'],
    ContentType = ModelTypes['schemas'][ModelTypes['tiles'][Alias]]
  >(alias: Alias): Promise<TileDocument<ContentType> | null> {
    const id = this.getTileID(alias)
    if (id == null) {
      throw new Error(`Tile alias "${alias as string}" is not defined`)
    }
    return await TileDocument.load<ContentType>(this._ceramic, id)
  }

  async createTile<
    Alias extends keyof ModelAliases['schemas'],
    ContentType = ModelTypes['schemas'][Alias]
  >(
    schemaAlias: Alias,
    content: ContentType,
    { pin }: CreateOptions = {}
  ): Promise<TileDocument<ContentType>> {
    const schema = this.getSchemaURL(schemaAlias)
    if (schema == null) {
      throw new Error(`Schema alias "${schemaAlias as string}" is not defined`)
    }

    const doc = await TileDocument.create<ContentType>(this._ceramic, content, { schema })
    if (pin ?? this._autopin) {
      await this._ceramic.pin.add(doc.id)
    }
    return doc
  }
}
