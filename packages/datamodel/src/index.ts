/**
 * ```sh
 * npm install @glazed/datamodel
 * ```
 *
 * @module datamodel
 */

import type { CeramicApi } from '@ceramicnetwork/common'
import type { TileDocument } from '@ceramicnetwork/stream-tile'
import { TileLoader } from '@glazed/tile-loader'
import type { TileCache } from '@glazed/tile-loader'
import type { ModelTypeAliases, ModelTypesToAliases } from '@glazed/types'

export type CreateOptions = {
  /**
   * Pin the created stream (default)
   */
  pin?: boolean
}

export type DataModelParams<Model> = {
  /**
   * Pin all created streams (default)
   */
  autopin?: boolean
  /**
   * {@linkcode TileLoader} cache parameter, only used if `loader` is not provided
   */
  cache?: TileCache | boolean
  /**
   * A Ceramic client instance, only used if `loader` is not provided
   */
  ceramic?: CeramicApi
  /**
   * A {@linkcode TileLoader} instance to use, must be provided if `ceramic` is not provided
   */
  loader?: TileLoader
  /**
   * The runtime model aliases to use
   */
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
  #loader: TileLoader
  #model: ModelAliases

  constructor(params: DataModelParams<ModelAliases>) {
    this.#autopin = params.autopin !== false
    this.#model = params.model

    if (params.loader != null) {
      this.#loader = params.loader
    } else if (params.ceramic == null) {
      throw new Error('Invalid DataModel parameters: missing ceramic or loader')
    } else {
      this.#loader = new TileLoader({ ceramic: params.ceramic, cache: params.cache })
    }
  }

  get loader(): TileLoader {
    return this.#loader
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

  /**
   * Load the TileDocument identified by the given `alias`.
   */
  async loadTile<
    Alias extends keyof ModelAliases['tiles'],
    ContentType = ModelTypes['schemas'][ModelTypes['tiles'][Alias]]
  >(alias: Alias): Promise<TileDocument<ContentType> | null> {
    const id = this.getTileID(alias)
    if (id == null) {
      throw new Error(`Tile alias "${alias as string}" is not defined`)
    }
    return await this.#loader.load<ContentType>(id)
  }

  /**
   * Create a TileDocument using a schema identified by the given `schemaAlias`.
   */
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

    return await this.#loader.create<ContentType>(
      content,
      { schema },
      { pin: pin ?? this.#autopin }
    )
  }
}
