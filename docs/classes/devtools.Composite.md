# Class: Composite

[devtools](../modules/devtools.md).Composite

The Composite class provides APIs for managing composites (sets of Model streams) through their
development lifecycle, including the creation of new Models, import and export of existing
composites encoded as JSON, and compilation to the runtime format used by the
[`GraphClient class`](graph.GraphClient.md).

Composite instances are **immutable**, so methods affecting the contents of the internal
composite definition will **return new instances** of the Composite class.

Composite class is exported by the [`devtools`](../modules/devtools.md) module.

```sh
import { Composite } from '@glazed/devtools'
```

## Constructors

### constructor

• **new Composite**(`params`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`CompositeParams`](../modules/devtools.md#compositeparams) |

## Properties

### VERSION

▪ `Static` **VERSION**: `string` = `'1.0'`

Current version of the composites format.

## Accessors

### hash

• `get` **hash**(): `string`

Stable hash of the internal definition, mostly used for comparisons.

#### Returns

`string`

## Methods

### copy

▸ **copy**(`models`): [`Composite`](devtools.Composite.md)

Copy a given set of Models identified by their stream ID, name or alias into a new Composite.

#### Parameters

| Name | Type |
| :------ | :------ |
| `models` | `string`[] |

#### Returns

[`Composite`](devtools.Composite.md)

___

### equals

▸ **equals**(`other`): `boolean`

Check if the composite is equal to the other one provided as input.

#### Parameters

| Name | Type |
| :------ | :------ |
| `other` | [`CompositeInput`](../modules/devtools.md#compositeinput) |

#### Returns

`boolean`

___

### merge

▸ **merge**(`other`, `options?`): [`Composite`](devtools.Composite.md)

Merge the composite with the other one(s) into a new Composite.

#### Parameters

| Name | Type |
| :------ | :------ |
| `other` | [`CompositeInput`](../modules/devtools.md#compositeinput) \| [`CompositeInput`](../modules/devtools.md#compositeinput)[] |
| `options` | [`CompositeOptions`](../modules/devtools.md#compositeoptions) |

#### Returns

[`Composite`](devtools.Composite.md)

___

### setAliases

▸ **setAliases**(`aliases`, `replace?`): [`Composite`](devtools.Composite.md)

Set aliases for the Models in the composite, merging with existing ones unless `replace` is
`true`, and return a new Composite.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `aliases` | `Record`<`string`, `string`\> | `undefined` |
| `replace` | `boolean` | `false` |

#### Returns

[`Composite`](devtools.Composite.md)

___

### setCommonEmbeds

▸ **setCommonEmbeds**(`names`, `replace?`): [`Composite`](devtools.Composite.md)

Set common embeds for the Models in the composite, merging with existing ones unless `replace`
is `true`, and return a new Composite.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `names` | `Iterable`<`string`\> | `undefined` |
| `replace` | `boolean` | `false` |

#### Returns

[`Composite`](devtools.Composite.md)

___

### setViews

▸ **setViews**(`views`, `replace?`): [`Composite`](devtools.Composite.md)

Set views for the Models in the composite, merging with existing ones unless `replace` is
`true`, and return a new Composite.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `views` | `CompositeViewsDefinition` | `undefined` |
| `replace` | `boolean` | `false` |

#### Returns

[`Composite`](devtools.Composite.md)

___

### toJSON

▸ **toJSON**(): `EncodedCompositeDefinition`

Return a JSON-encoded [`CompositeDefinition`](../modules/types.md#encodedcompositedefinition)
structure that can be shared and reused.

#### Returns

`EncodedCompositeDefinition`

___

### toParams

▸ **toParams**(): [`CompositeParams`](../modules/devtools.md#compositeparams)

Return a deep clone of the internal [`CompositeParams`](../modules/devtools.md#compositeparams) for safe external access.

#### Returns

[`CompositeParams`](../modules/devtools.md#compositeparams)

___

### toRuntime

▸ **toRuntime**(): `RuntimeCompositeDefinition`

Return a [`RuntimeCompositeDefinition`](../modules/types.md#runtimecompositedefinition) to be used
at runtime by the [`GraphClient`](graph.GraphClient.md).

#### Returns

`RuntimeCompositeDefinition`

___

### create

▸ `Static` **create**(`params`): `Promise`<[`Composite`](devtools.Composite.md)\>

Create new model streams based on the provided `schema` and group them in a composite
wrapped in a Composite instance.

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`CreateParams`](../modules/devtools.md#createparams) |

#### Returns

`Promise`<[`Composite`](devtools.Composite.md)\>

___

### from

▸ `Static` **from**(`composites`, `options?`): [`Composite`](devtools.Composite.md)

Create a Composite instance by merging existing composites.

#### Parameters

| Name | Type |
| :------ | :------ |
| `composites` | `Iterable`<[`CompositeInput`](../modules/devtools.md#compositeinput)\> |
| `options?` | [`CompositeOptions`](../modules/devtools.md#compositeoptions) |

#### Returns

[`Composite`](devtools.Composite.md)

___

### fromJSON

▸ `Static` **fromJSON**(`params`): `Promise`<[`Composite`](devtools.Composite.md)\>

Create a Composite instance from a JSON-encoded
[`CompositeDefinition`](../modules/types.md#encodedcompositedefinition).

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`FromJSONParams`](../modules/devtools.md#fromjsonparams) |

#### Returns

`Promise`<[`Composite`](devtools.Composite.md)\>

___

### fromModels

▸ `Static` **fromModels**(`params`): `Promise`<[`Composite`](devtools.Composite.md)\>

Create a Composite instance from a set of Model streams already present on a Ceramic node.

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`FromModelsParams`](../modules/devtools.md#frommodelsparams) |

#### Returns

`Promise`<[`Composite`](devtools.Composite.md)\>
