[@glazed/did-datastore](README.md) / Exports

# @glazed/did-datastore

## Table of contents

### Classes

- [DIDDataStore](classes/DIDDataStore.md)

### Type aliases

- [CreateOptions](modules.md#createoptions)
- [DIDDataStoreParams](modules.md#diddatastoreparams)
- [DefinitionWithID](modules.md#definitionwithid)
- [Entry](modules.md#entry)

### Functions

- [assertDIDstring](modules.md#assertdidstring)
- [isDIDstring](modules.md#isdidstring)

## Type aliases

### CreateOptions

Ƭ **CreateOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `pin?` | `boolean` |

#### Defined in

[index.ts:38](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L38)

___

### DIDDataStoreParams

Ƭ **DIDDataStoreParams**<`ModelTypes`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases``ModelTypeAliases` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `autopin?` | `boolean` |
| `ceramic` | `CeramicApi` |
| `model` | `DataModel`<`ModelTypes`\> \| `ModelTypesToAliases`<`ModelTypes`\> |

#### Defined in

[index.ts:42](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L42)

___

### DefinitionWithID

Ƭ **DefinitionWithID**<`Config`\>: `Definition`<`Config`\> & { `id`: `StreamID`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Config` | extends `Record`<`string`, `unknown`\>`Record`<`string`, `unknown`\> |

#### Defined in

[index.ts:29](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L29)

___

### Entry

Ƭ **Entry**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `key` | `string` |
| `record` | `unknown` |

#### Defined in

[index.ts:32](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L32)

## Functions

### assertDIDstring

▸ **assertDIDstring**(`did`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`void`

#### Defined in

[utils.ts:6](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/utils.ts#L6)

___

### isDIDstring

▸ **isDIDstring**(`did`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`boolean`

#### Defined in

[utils.ts:2](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/utils.ts#L2)
