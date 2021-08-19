/**
 * ```sh
 * npm install @glazed/datamodel
 * ```
 *
 * @module datamodel
 */

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

/**
 * ```sh
 * import { DataModel } from '@glazed/datamodel'
 * ```
 */
export class DataModel<
  ModelTypes extends ModelTypeAliases,
  ModelAliases extends ModelTypesToAliases<ModelTypes> = ModelTypesToAliases<ModelTypes>
> {
  #autopin: boolean
  #ceramic: CeramicApi
  #model: ModelAliases

  constructor({ autopin, ceramic, model }: DataModelParams<ModelAliases>) {
    this.#autopin = autopin !== false
    this.#ceramic = ceramic
    this.#model = model
  }

  get ceramic(): CeramicApi {
    return this.#ceramic
  }

  getDefinitionID<Alias extends keyof ModelAliases['definitions']>(alias: Alias): string | null {
    return this.#model.definitions[alias] ?? null
  }

  getSchemaURL<Alias extends keyof ModelAliases['schemas']>(alias: Alias): string | null {
    return this.#model.schemas[alias] ?? null
  }

  getTileID<Alias extends keyof ModelAliases['tiles']>(alias: Alias): string | null {
    return this.#model.tiles[alias] ?? null
  }

  async loadTile<
    Alias extends keyof ModelAliases['tiles'],
    ContentType = ModelTypes['schemas'][ModelTypes['tiles'][Alias]]
  >(alias: Alias): Promise<TileDocument<ContentType> | null> {
    const id = this.getTileID(alias)
    if (id == null) {
      throw new Error(`Tile alias "${alias as string}" is not defined`)
    }
    return await TileDocument.load<ContentType>(this.#ceramic, id)
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

    const doc = await TileDocument.create<ContentType>(this.#ceramic, content, { schema })
    if (pin ?? this.#autopin) {
      await this.#ceramic.pin.add(doc.id)
    }
    return doc
  }
}
