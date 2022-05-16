# Class: Composite

[devtools](../modules/devtools.md).Composite

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

## Methods

### clone

▸ **clone**(): [`Composite`](devtools.Composite.md)

#### Returns

[`Composite`](devtools.Composite.md)

___

### composeWith

▸ **composeWith**(`other`, `options?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `other` | [`ComposeInput`](../modules/devtools.md#composeinput) \| [`ComposeInput`](../modules/devtools.md#composeinput)[] |
| `options` | [`ComposeOptions`](../modules/devtools.md#composeoptions) |

#### Returns

`void`

___

### setAliases

▸ **setAliases**(`aliases`, `replace?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `aliases` | `Record`<`string`, `string`\> | `undefined` |
| `replace` | `boolean` | `false` |

#### Returns

`void`

___

### setCommonEmbeds

▸ **setCommonEmbeds**(`names`, `replace?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `names` | `string`[] \| `Set`<`string`\> | `undefined` |
| `replace` | `boolean` | `false` |

#### Returns

`void`

___

### setViews

▸ **setViews**(`views`, `replace?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `views` | `CompositeViewsDefinition` | `undefined` |
| `replace` | `boolean` | `false` |

#### Returns

`void`

___

### toJSON

▸ **toJSON**(): `EncodedCompositeDefinition`

#### Returns

`EncodedCompositeDefinition`

___

### toParams

▸ **toParams**(): [`CompositeParams`](../modules/devtools.md#compositeparams)

#### Returns

[`CompositeParams`](../modules/devtools.md#compositeparams)

___

### toRuntime

▸ **toRuntime**(): `RuntimeCompositeDefinition`

#### Returns

`RuntimeCompositeDefinition`

___

### compose

▸ `Static` **compose**(`composites`, `options?`): [`Composite`](devtools.Composite.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `composites` | [`ComposeInput`](../modules/devtools.md#composeinput)[] |
| `options?` | [`ComposeOptions`](../modules/devtools.md#composeoptions) |

#### Returns

[`Composite`](devtools.Composite.md)

___

### fromJSON

▸ `Static` **fromJSON**(`params`): `Promise`<[`Composite`](devtools.Composite.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`FromJSONParams`](../modules/devtools.md#fromjsonparams) |

#### Returns

`Promise`<[`Composite`](devtools.Composite.md)\>

___

### fromSchema

▸ `Static` **fromSchema**(`_params`): `Promise`<[`Composite`](devtools.Composite.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `_params` | [`FromSchemaParams`](../modules/devtools.md#fromschemaparams) |

#### Returns

`Promise`<[`Composite`](devtools.Composite.md)\>
