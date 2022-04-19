# Module: devtools

Development tools library.

## Purpose

The `devtools` library provides APIs to help support common use-cases when building applications
on top of Ceramic, notably as a complement to the runtime Glaze libraries. It is meant to be
used by developers in scripts or other tools such as the CLI, not as a runtime library.

The [`ModelManager`](../classes/devtools.ModelManager.md) class notably allows developers to create, update and deploy data
models to be used with the [`DataModel`](../classes/datamodel.DataModel.md) runtime.

## Installation

```sh
npm install --dev @glazed/devtools
```

## Common use-cases

### Add an existing schema to a model

An existing schema can be added using the
[`useDeployedSchema`](../classes/devtools.ModelManager.md#usedeployedschema) method, as shown below.

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ModelManager } from '@glazed/devtools'

const ceramic = new CeramicClient()
const manager = new ModelManager({ ceramic })

// Set the alias (human-readable name) and stream reference (stream or commit ID or URL) of the
// schema to add to the model. The schema must be already present on the Ceramic node.
await manager.useDeployedSchema('MySchema', 'ceramic://k2...ab')
```

The [`useDeployedDefinition`](../classes/devtools.ModelManager.md#usedeployeddefinition) and
[`useDeployedTile`](../classes/devtools.ModelManager.md#usedeployedtile) methods can be used similarly to add
definitions and tiles to the model.

### Create and add a schema to a model

Using the [`createSchema`](../classes/devtools.ModelManager.md#createschema) method allows to create the schema
on the Ceramic node and add it to the model. Note that using this method creates a new schema
every time it is called, therefore generating different stream IDs.

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ModelManager } from '@glazed/devtools'

const ceramic = new CeramicClient()
const manager = new ModelManager({ ceramic })

// Set the alias (human-readable name) and JSON schema contents
await manager.createSchema('MySchema', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'MySchema',
  type: 'object',
  properties: {
    ...
  },
})
```

The [`createDefinition`](../classes/devtools.ModelManager.md#createdefinition) and
[`createTile`](../classes/devtools.ModelManager.md#createtile) methods can be used similarly to add definitions
and tiles to the model.

### Export a model to JSON

A managed model can be serialized to JSON, making it portable and reusable, with the
[`toJSON`](../classes/devtools.ModelManager.md#tojson) method.

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ModelManager } from '@glazed/devtools'

const ceramic = new CeramicClient()
const manager = new ModelManager({ ceramic })

await manager.useDeployedSchema('MySchema', 'ceramic://k2...ab')
const encodedModel = await manager.toJSON()
```

### Import a model from JSON

A managed model serialized using the [`toJSON`](../classes/devtools.ModelManager.md#tojson) method can be
deserialized with the [`fromJSON`](../classes/devtools.ModelManager.md#fromjson) static method.

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ModelManager } from '@glazed/devtools'

const ceramic = new CeramicClient()
const manager = new ModelManager({ ceramic })

await manager.useDeployedSchema('MySchema', 'ceramic://k2...ab')
const encodedModel = await manager.toJSON()

// The `clonedManager` instance will contain the same model as the `manager` instance
const clonedManager = ModelManager.fromJSON(ceramic, encodedModel)
```

### Deploy a model to Ceramic

In order to use a model at runtime in an application, it is important to ensure all the streams
used by the model are present in the Ceramic network. This can be achieved by calling the
[`deploy`](../classes/devtools.ModelManager.md#deploy) method, which returns the aliases of the model that can
be used at runtime by a [`DataModel`](../classes/datamodel.DataModel.md) instance.

```ts
import { readFile, writeFile } from 'node:fs/promises'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ModelManager } from '@glazed/devtools'

// The encoded model could be imported from the file system for example
const bytes = await readFile(new URL('encoded-model.json', import.meta.url))
const encodedModel = JSON.parse(bytes.toString())

const ceramic = new CeramicClient()
const manager = ModelManager.fromJSON(ceramic, encodedModel)

// The deployed model aliases could then be exported to be used at runtime
const aliases = await manager.deploy()
await writeFile(new URL('model-aliases.json', import.meta.url), JSON.stringify(aliases))
```

### Use existing models

A model can be created by combining other models. For example, using the models for the
[CIP-19 "Basic Profile"](https://github.com/ceramicnetwork/CIP/blob/main/CIPs/CIP-19/CIP-19.md),
[CIP-21 "Crypto Accounts"](https://github.com/ceramicnetwork/CIP/blob/main/CIPs/CIP-21/CIP-21.md)
and [CIP-23 "Also Known As"](https://github.com/ceramicnetwork/CIP/blob/main/CIPs/CIP-23/CIP-23.md)
specifications provided by the following packages:

```sh
npm install --dev @datamodels/identity-profile-basic @datamodels/identity-accounts-crypto @datamodels/identity-accounts-web
```

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ModelManager } from '@glazed/devtools'
import { model as basicProfileModel } from '@datamodels/identity-profile-basic'
import { model as cryptoAccountsModel } from '@datamodels/identity-accounts-crypto'
import { model as webAccountsModel } from '@datamodels/identity-accounts-web'

const ceramic = new CeramicClient()
const manager = new ModelManager({ ceramic })

// Add the imported models to the manager
manager.addJSONModel(basicProfileModel)
manager.addJSONModel(cryptoAccountsModel)
manager.addJSONModel(webAccountsModel)

// Once deployed, the streams are available on the Ceramic node
await manager.deploy()
```

## Classes

- [ModelManager](../classes/devtools.ModelManager.md)

## Type aliases

### FromJSONParams

Ƭ **FromJSONParams**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `ceramic` | `CeramicApi` | Ceramic client instance |
| `model` | `EncodedManagedModel` | [`JSON-encoded managed model`](types.md#encodedmanagedmodel) to use |

___

### ModelManagerConfig

Ƭ **ModelManagerConfig**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `ceramic` | `CeramicApi` | Ceramic client instance |
| `model?` | `ManagedModel` | Optional [`managed model`](types.md#managedmodel) to use |

## Functions

### deployEncodedModel

▸ **deployEncodedModel**(`ceramic`, `model`): `Promise`<`ModelAliases`\>

Deploy a [`JSON-encoded managed model`](types.md#encodedmanagedmodel) to the given Ceramic
node.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ceramic` | `CeramicApi` |
| `model` | `EncodedManagedModel` |

#### Returns

`Promise`<`ModelAliases`\>

___

### deployModel

▸ **deployModel**(`ceramic`, `model`, `createOpts?`, `commitOpts?`): `Promise`<`ModelAliases`\>

Deploy a managed model to the given Ceramic node.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ceramic` | `CeramicApi` |
| `model` | `ManagedModel`<`DagJWSResult`\> |
| `createOpts?` | `CreateOpts` |
| `commitOpts?` | `UpdateOpts` |

#### Returns

`Promise`<`ModelAliases`\>

___

### isSecureSchema

▸ **isSecureSchema**<`T`\>(`schema`): `boolean`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | `UncheckedJSONSchemaType`<`T`, ``false``\> |

#### Returns

`boolean`
