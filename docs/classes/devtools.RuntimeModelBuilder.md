# Class: RuntimeModelBuilder

[devtools](../modules/devtools.md).RuntimeModelBuilder

## Constructors

### constructor

• **new RuntimeModelBuilder**(`params`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`RuntimeModelBuilderParams`](../modules/devtools.md#runtimemodelbuilderparams) |

## Methods

### \_buildList

▸ **_buildList**(`schema`, `params?`): `RuntimeList`

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | `Array`<`any`\> |
| `params` | [`ExtractSchemaParams`](../modules/devtools.md#extractschemaparams) |

#### Returns

`RuntimeList`

___

### \_buildListReference

▸ **_buildListReference**(`reference`, `params?`): `RuntimeScalar` \| `RuntimeReference`<``"object"``\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `reference` | `string` |
| `params` | [`ExtractSchemaParams`](../modules/devtools.md#extractschemaparams) |

#### Returns

`RuntimeScalar` \| `RuntimeReference`<``"object"``\>

___

### \_buildObject

▸ **_buildObject**(`schema`, `params?`): `RuntimeObjectFields`

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | `Object`<`any`\> |
| `params` | [`ExtractSchemaParams`](../modules/devtools.md#extractschemaparams) |

#### Returns

`RuntimeObjectFields`

___

### \_buildObjectField

▸ **_buildObjectField**(`schema`, `params?`): `RuntimeObjectField`

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | `AnySchema` |
| `params` | [`ExtractSchemaParams`](../modules/devtools.md#extractschemaparams) |

#### Returns

`RuntimeObjectField`

___

### \_buildObjectReferenceField

▸ **_buildObjectReferenceField**(`schema`, `params?`): `RuntimeReference`<``"object"``\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | `Object`<`any`\> |
| `params` | [`ExtractSchemaParams`](../modules/devtools.md#extractschemaparams) |

#### Returns

`RuntimeReference`<``"object"``\>

___

### \_buildReferenceSchema

▸ **_buildReferenceSchema**(`reference`, `params?`): `RuntimeObjectField`

#### Parameters

| Name | Type |
| :------ | :------ |
| `reference` | `string` |
| `params` | [`ExtractSchemaParams`](../modules/devtools.md#extractschemaparams) |

#### Returns

`RuntimeObjectField`

___

### \_buildScalar

▸ **_buildScalar**(`schema`, `params?`): `RuntimeScalar`

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | `ScalarSchema` |
| `params` | [`ExtractSchemaParams`](../modules/devtools.md#extractschemaparams) |

#### Returns

`RuntimeScalar`

___

### \_buildViews

▸ **_buildViews**(`object`, `views?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `RuntimeObjectFields` |
| `views` | `ModelViewsDefinition` |

#### Returns

`void`

___

### \_getName

▸ **_getName**(`schema`, `params`, `isReference?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `schema` | `AnySchema` | `undefined` |
| `params` | [`ExtractSchemaParams`](../modules/devtools.md#extractschemaparams) | `undefined` |
| `isReference` | `boolean` | `false` |

#### Returns

`string`

___

### \_getReferenceSchema

▸ **_getReferenceSchema**<`T`\>(`reference`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `AnySchema` = `AnySchema` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `reference` | `string` |

#### Returns

`T`

___

### build

▸ **build**(): `Record`<`string`, `RuntimeObjectFields`\>

#### Returns

`Record`<`string`, `RuntimeObjectFields`\>
