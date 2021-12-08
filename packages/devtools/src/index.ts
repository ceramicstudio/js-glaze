/**
 * Development tools library.
 *
 * ## Purpose
 *
 * The `devtools` library provides APIs to help support common use-cases when building applications
 * on top of Ceramic, notably as a complement to the runtime Glaze libraries. It is meant to be
 * used by developers in scripts or other tools such as the CLI, not as a runtime library.
 *
 * The {@linkcode ModelManager} class notably allows developers to create, update and publish data
 * models to be used with the {@linkcode datamodel.DataModel DataModel} runtime.
 *
 * ## Installation
 *
 * ```sh
 * npm install --dev @glazed/devtools
 * ```
 *
 * ## Common use-cases
 *
 * ### Add an existing schema to a model
 *
 * An existing schema can be added using the
 * {@linkcode ModelManager.usePublishedSchema usePublishedSchema} method, as shown below.
 *
 * ```ts
 * import { CeramicClient } from '@ceramicnetwork/http-client'
 * import { ModelManager } from '@glazed/devtools'
 *
 * const ceramic = new CeramicClient()
 * const manager = new ModelManager(ceramic)
 *
 * // Set the alias (human-readable name) and stream reference (stream or commit ID or URL) of the
 * // schema to add to the model. The schema must be already present on the Ceramic node.
 * await manager.usePublishedSchema('MySchema', 'ceramic://k2...ab')
 * ```
 *
 * The {@linkcode ModelManager.usePublishedDefinition usePublishedDefinition} and
 * {@linkcode ModelManager.usePublishedTile usePublishedTile} methods can be used similarly to add
 * definitions and tiles to the model.
 *
 * ### Create and add a schema to a model
 *
 * Using the {@linkcode ModelManager.createSchema createSchema} method allows to create the schema
 * on the Ceramic node and add it to the model. Note that using this method creates a new schema
 * every time it is called, therefore generating different stream IDs.
 *
 * ```ts
 * import { CeramicClient } from '@ceramicnetwork/http-client'
 * import { ModelManager } from '@glazed/devtools'
 *
 * const ceramic = new CeramicClient()
 * const manager = new ModelManager(ceramic)
 *
 * // Set the alias (human-readable name) and JSON schema contents
 * await manager.createSchema('MySchema', {
 *   $schema: 'http://json-schema.org/draft-07/schema#',
 *   title: 'MySchema',
 *   type: 'object',
 *   properties: {
 *     ...
 *   },
 * })
 * ```
 *
 * The {@linkcode ModelManager.createDefinition createDefinition} and
 * {@linkcode ModelManager.createTile createTile} methods can be used similarly to add definitions
 * and tiles to the model.
 *
 * ### Export a model to JSON
 *
 * A managed model can be serialized to JSON, making it portable and reusable, with the
 * {@linkcode ModelManager.toJSON toJSON} method.
 *
 * ```ts
 * import { CeramicClient } from '@ceramicnetwork/http-client'
 * import { ModelManager } from '@glazed/devtools'
 *
 * const ceramic = new CeramicClient()
 * const manager = new ModelManager(ceramic)
 *
 * await manager.usePublishedSchema('MySchema', 'ceramic://k2...ab')
 * const encodedModel = await manager.toJSON()
 * ```
 *
 * ### Import a model from JSON
 *
 * A managed model serialized using the {@linkcode ModelManager.toJSON toJSON} method can be
 * deserialized with the {@linkcode ModelManager.fromJSON fromJSON} static method.
 *
 * ```ts
 * import { CeramicClient } from '@ceramicnetwork/http-client'
 * import { ModelManager } from '@glazed/devtools'
 *
 * const ceramic = new CeramicClient()
 * const manager = new ModelManager(ceramic)
 *
 * await manager.usePublishedSchema('MySchema', 'ceramic://k2...ab')
 * const encodedModel = await manager.toJSON()
 *
 * // The `clonedManager` instance will contain the same model as the `manager` instance
 * const clonedManager = ModelManager.fromJSON(ceramic, encodedModel)
 * ```
 *
 * ### Publish a model to Ceramic
 *
 * In order to use a model at runtime in an application, it is important to ensure all the streams
 * used by the model are present in the Ceramic network. This can be achieved by calling the
 * {@linkcode ModelManager.toPublished toPublished} method, which returns a published model object
 * that can be used at runtime by a {@linkcode datamodel.DataModel DataModel} instance.
 *
 * ```ts
 * import { readFile, writeFile } from 'node:fs/promises'
 * import { CeramicClient } from '@ceramicnetwork/http-client'
 * import { ModelManager } from '@glazed/devtools'
 *
 * // The encoded model could be imported from the file system for example
 * const bytes = await readFile(new URL('encoded-model.json', import.meta.url))
 * const encodedModel = JSON.parse(bytes.toString())
 *
 * const ceramic = new CeramicClient()
 * const manager = ModelManager.fromJSON(ceramic, encodedModel)
 *
 * // The published model could then itself be exported to be used at runtime
 * const publishedModel = await manager.toPublished()
 * await writeFile(new URL('published-model.json', import.meta.url), JSON.stringify(publishedModel))
 * ```
 *
 * ### Use existing models
 *
 * A model can be created by combining other models. For example, using the models for the
 * [CIP-19 "Basic Profile"](https://github.com/ceramicnetwork/CIP/blob/main/CIPs/CIP-19/CIP-19.md),
 * [CIP-21 "Crypto Accounts"](https://github.com/ceramicnetwork/CIP/blob/main/CIPs/CIP-21/CIP-21.md)
 * and [CIP-23 "Also Known As"](https://github.com/ceramicnetwork/CIP/blob/main/CIPs/CIP-23/CIP-23.md)
 * specifications provided by the following packages:
 *
 * ```sh
 * npm install --dev @datamodels/identity-profile-basic @datamodels/identity-accounts-crypto @datamodels/identity-accounts-web
 * ```
 *
 * ```ts
 * import { CeramicClient } from '@ceramicnetwork/http-client'
 * import { ModelManager } from '@glazed/devtools'
 * import { model as basicProfileModel } from '@datamodels/identity-profile-basic'
 * import { model as cryptoAccountsModel } from '@datamodels/identity-accounts-crypto'
 * import { model as webAccountsModel } from '@datamodels/identity-accounts-web'
 *
 * const ceramic = new CeramicClient()
 * const manager = new ModelManager(ceramic)
 *
 * // Add the imported models to the manager
 * manager.addJSONModel(basicProfileModel)
 * manager.addJSONModel(cryptoAccountsModel)
 * manager.addJSONModel(webAccountsModel)
 *
 * // Once published, the streams are available on the Ceramic node
 * await manager.toPublished()
 * ```
 *
 * @module devtools
 */

export * from './datamodel'
export * from './encoding'
export * from './graphql'
export * from './publishing'
export * from './schema'
export * from './utils'
export * from './validation'
