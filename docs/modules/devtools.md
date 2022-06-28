# Module: devtools

Development tools library.

## Installation

```sh
npm install --dev @glazed/devtools
```

## Classes

- [Composite](../classes/devtools.Composite.md)

## Type Aliases

### CompositeInput

Ƭ **CompositeInput**: [`Composite`](../classes/devtools.Composite.md) \| [`CompositeParams`](devtools.md#compositeparams)

Supported composite input when comparing or merging composites.

___

### CompositeOptions

Ƭ **CompositeOptions**: `Object`

Supported options for merging composites.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `aliases?` | `Record`<`string`, `string`\> | Additional Models aliases merged in the composite in addition to the ones present in the source composites. |
| `commonEmbeds?` | ``"all"`` \| ``"none"`` \| `Iterable`<`string`\> | Behavior to apply for merging common embeds: - `none` (default) will not set an common embed - `all` will merge all the common embeds found in any composite - explicit embed names to set as common embeds |
| `views?` | `CompositeViewsDefinition` | Additional views merged in the composite in addition to the ones present in the source composites. |

___

### CompositeParams

Ƭ **CompositeParams**: `Object`

Composite instance creation parameters.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `commits` | `Record`<`string`, `StreamCommits`\> | Model streams commits, that can be pushed to any Ceramic node to ensure the Model streams used by a composite are available. |
| `definition` | `InternalCompositeDefinition` | Internal metadata describing the composite. |

___

### CreateParams

Ƭ **CreateParams**: `Object`

Composite creation parameters from a schema.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `ceramic` | `CeramicApi` | Ceramic instance connected to the node the new Model streams must be created on. The Ceramic instance **must have an authenticated DID attached to it** in order to create Models, using the `did:key` method. |
| `schema` | `string` \| `GraphQLSchema` | Composite schema string or GraphQLSchema object. |

___

### FromJSONParams

Ƭ **FromJSONParams**: `Object`

Composite creation parameters from a JSON-encoded definition.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `ceramic` | `CeramicApi` | Ceramic instance connected to the node where the Model stream will be pushed. |
| `definition` | `EncodedCompositeDefinition` | JSON-encoded composite definition. |

___

### FromModelsParams

Ƭ **FromModelsParams**: [`CompositeOptions`](devtools.md#compositeoptions) & { `ceramic`: `CeramicApi` ; `models`: `string`[]  }

Composite creation parameters from existing models.
