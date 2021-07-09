import type { CeramicApi } from '@ceramicnetwork/common'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { PublishedModel } from '@glazed/common'

export type ModelTypeAliases<
  // Schema alias to content type
  Schemas extends Record<string, any> = Record<string, any>,
  // Definition alias to schema alias
  Definitions extends Record<string, keyof Schemas> = Record<string, string>,
  // Tile alias to schema alias
  Tiles extends Record<string, keyof Schemas> = Record<string, string>
> = {
  schemas: Schemas
  definitions: Definitions
  tiles: Tiles
}

// Internal utilty type to ensure Record keys are strings
type KeyOf<Rec extends Record<string, any>, Key extends string> = keyof Rec[Key] & string

type ModelTypesToAliases<TypeAliases extends ModelTypeAliases> = {
  schemas: Record<KeyOf<TypeAliases, 'schemas'>, string>
  definitions: Record<KeyOf<TypeAliases, 'definitions'>, string>
  tiles: Record<KeyOf<TypeAliases, 'tiles'>, string>
}

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
  Model extends ModelTypesToAliases<ModelTypes> = ModelTypesToAliases<ModelTypes>
> implements PublishedModel
{
  _autopin: boolean
  _ceramic: CeramicApi
  _model: Model

  constructor({ autopin, ceramic, model }: DataModelParams<Model>) {
    this._autopin = autopin !== false
    this._ceramic = ceramic
    this._model = model
  }

  get ceramic(): CeramicApi {
    return this._ceramic
  }

  get definitions(): Model['definitions'] {
    return this._model.definitions
  }

  get schemas(): Model['schemas'] {
    return this._model.schemas
  }

  get tiles(): Model['tiles'] {
    return this._model.tiles
  }

  getDefinitionID<Alias extends KeyOf<Model, 'definitions'>>(alias: Alias): string | null {
    return this._model.definitions[alias] ?? null
  }

  getSchemaURL<Alias extends KeyOf<Model, 'schemas'>>(alias: Alias): string | null {
    return this._model.schemas[alias] ?? null
  }

  getTileID<Alias extends KeyOf<Model, 'tiles'>>(alias: Alias): string | null {
    return this._model.tiles[alias] ?? null
  }

  async loadTile<Alias extends KeyOf<Model, 'tiles'>, ContentType = ModelTypes['schemas'][Alias]>(
    alias: Alias
  ): Promise<TileDocument<ContentType> | null> {
    const id = this.getTileID(alias)
    if (id == null) {
      throw new Error(`Tile alias "${alias}" is not defined`)
    }
    return await TileDocument.load<ContentType>(this._ceramic, id)
  }

  async createTile<
    Alias extends KeyOf<Model, 'schemas'>,
    ContentType = ModelTypes['schemas'][Alias]
  >(
    schemaAlias: Alias,
    content: ContentType,
    { pin }: CreateOptions = {}
  ): Promise<TileDocument<ContentType>> {
    const schema = this.getSchemaURL(schemaAlias)
    if (schema == null) {
      throw new Error(`Schema alias "${schemaAlias}" is not defined`)
    }

    const doc = await TileDocument.create<ContentType>(this._ceramic, content, { schema })
    if (pin ?? this._autopin) {
      await this._ceramic.pin.add(doc.id)
    }
    return doc
  }
}
