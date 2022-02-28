/**
 * Aliases for Ceramic stream references.
 *
 * ## Purpose
 *
 * The `datamodel` module exports a `DataModel` class for **runtime** interactions with a published
 * data model, using aliases for Ceramic stream IDs.
 *
 * ## Installation
 *
 * ```sh
 * npm install @glazed/datamodel
 * ```
 *
 * ## Common use-cases
 *
 * ### Get the ID of a known alias
 *
 * ```ts
 * import { CeramicClient } from '@ceramicnetwork/http-client'
 * import { DataModel } from '@glazed/datamodel'
 *
 * const ceramic = new CeramicClient()
 * const aliases = {
 *  schemas: {
 *     MySchema: 'ceramic://k2...ab',
 *   },
 *   definitions: {
 *     myDefinition: 'k2...ef',
 *   },
 *   tiles: {},
 * }
 * const model = new DataModel({ ceramic, aliases })
 *
 * function getMySchemaURL() {
 *   return model.getSchemaURL('MySchema') // 'ceramic://k2...ab'
 * }
 *
 * function getMyDefinitionID() {
 *   return model.getDefinitionID('myDefinition') // 'k2...ef'
 * }
 * ```
 *
 * ### Load a tile by alias
 *
 * ```ts
 * import { CeramicClient } from '@ceramicnetwork/http-client'
 * import { DataModel } from '@glazed/datamodel'
 *
 * const ceramic = new CeramicClient()
 * const aliases = {
 *  schemas: {
 *     MySchema: 'ceramic://k2...ab',
 *   },
 *   definitions: {},
 *   tiles: {
 *     myTile: 'k2...cd',
 *   },
 * }
 * const model = new DataModel({ ceramic, aliases })
 *
 * async function loadMyTile() {
 *   return await model.loadTile('myTile')
 * }
 * ```
 *
 * ### Create a tile with a schema alias
 *
 * ```ts
 * import { CeramicClient } from '@ceramicnetwork/http-client'
 * import { DataModel } from '@glazed/datamodel'
 *
 * const ceramic = new CeramicClient()
 * const aliases = {
 *  schemas: {
 *     MySchema: 'ceramic://k2...ab',
 *   },
 *   definitions: {},
 *   tiles: {},
 * }
 * const model = new DataModel({ ceramic, aliases })
 *
 * async function createTileWithMySchema(content) {
 *   return await model.createTile('MySchema', content)
 * }
 * ```
 *
 * @module datamodel
 */

import type { CeramicApi, CreateOpts } from '@ceramicnetwork/common'
import type { TileDocument, TileMetadataArgs } from '@ceramicnetwork/stream-tile'
import { TileLoader } from '@glazed/tile-loader'
import type { TileCache } from '@glazed/tile-loader'
import type { ModelTypeAliases, ModelTypesToAliases } from '@glazed/types'

export type CreateOptions = CreateOpts & { controller?: string }

export type DataModelParams<Aliases> = {
  /**
   * The runtime model aliases to use
   */
  aliases: Aliases
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
  #aliases: ModelAliases
  #loader: TileLoader

  constructor(params: DataModelParams<ModelAliases>) {
    this.#aliases = params.aliases

    if (params.loader != null) {
      this.#loader = params.loader
    } else if (params.ceramic == null) {
      throw new Error('Invalid DataModel parameters: missing ceramic or loader')
    } else {
      this.#loader = new TileLoader({ ceramic: params.ceramic, cache: params.cache })
    }
  }

  get aliases(): ModelAliases {
    return this.#aliases
  }

  get loader(): TileLoader {
    return this.#loader
  }

  getDefinitionID<Alias extends keyof ModelAliases['definitions']>(alias: Alias): string | null {
    return this.#aliases.definitions[alias] ?? null
  }

  getSchemaURL<Alias extends keyof ModelAliases['schemas']>(alias: Alias): string | null {
    return this.#aliases.schemas[alias] ?? null
  }

  getTileID<Alias extends keyof ModelAliases['tiles']>(alias: Alias): string | null {
    return this.#aliases.tiles[alias] ?? null
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
    options: CreateOptions = {}
  ): Promise<TileDocument<ContentType>> {
    const schema = this.getSchemaURL(schemaAlias)
    if (schema == null) {
      throw new Error(`Schema alias "${schemaAlias as string}" is not defined`)
    }

    const { controller, ...opts } = options
    const metadata: TileMetadataArgs = { schema }
    if (controller != null) {
      metadata.controllers = [controller]
    }

    return await this.#loader.create<ContentType>(content, metadata, opts)
  }
}
