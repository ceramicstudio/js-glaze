[@glazed/did-datastore](../README.md) / [Exports](../modules.md) / DIDDataStore

# Class: DIDDataStore<ModelTypes, Alias\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases``ModelTypeAliases` |
| `Alias` | extends keyof `ModelTypes`[``"definitions"``]keyof `ModelTypes`[``"definitions"``] |

## Table of contents

### Constructors

- [constructor](DIDDataStore.md#constructor)

### Accessors

- [authenticated](DIDDataStore.md#authenticated)
- [ceramic](DIDDataStore.md#ceramic)
- [id](DIDDataStore.md#id)
- [model](DIDDataStore.md#model)

### Methods

- [get](DIDDataStore.md#get)
- [getDefinition](DIDDataStore.md#getdefinition)
- [getDefinitionID](DIDDataStore.md#getdefinitionid)
- [getIndex](DIDDataStore.md#getindex)
- [getRecord](DIDDataStore.md#getrecord)
- [getRecordDocument](DIDDataStore.md#getrecorddocument)
- [getRecordID](DIDDataStore.md#getrecordid)
- [has](DIDDataStore.md#has)
- [iterator](DIDDataStore.md#iterator)
- [merge](DIDDataStore.md#merge)
- [remove](DIDDataStore.md#remove)
- [set](DIDDataStore.md#set)
- [setAll](DIDDataStore.md#setall)
- [setDefaults](DIDDataStore.md#setdefaults)
- [setRecord](DIDDataStore.md#setrecord)

## Constructors

### constructor

• **new DIDDataStore**<`ModelTypes`, `Alias`\>(`__namedParameters`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\>`ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\> |
| `Alias` | extends `string` \| `number` \| `symbol`keyof `ModelTypes`[``"definitions"``] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`DIDDataStoreParams`](../modules.md#diddatastoreparams)<`ModelTypes`\> |

#### Defined in

[index.ts:58](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L58)

## Accessors

### authenticated

• `get` **authenticated**(): `boolean`

#### Returns

`boolean`

#### Defined in

[index.ts:66](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L66)

___

### ceramic

• `get` **ceramic**(): `CeramicApi`

#### Returns

`CeramicApi`

#### Defined in

[index.ts:70](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L70)

___

### id

• `get` **id**(): `string`

#### Returns

`string`

#### Defined in

[index.ts:74](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L74)

___

### model

• `get` **model**(): `DataModel`<`ModelTypes`, `ModelTypesToAliases`<`ModelTypes`\>\>

#### Returns

`DataModel`<`ModelTypes`, `ModelTypesToAliases`<`ModelTypes`\>\>

#### Defined in

[index.ts:81](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L81)

## Methods

### get

▸ **get**<`Key`, `ContentType`\>(`key`, `did?`): `Promise`<``null`` \| `ContentType`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Key` | extends `string` \| `number` \| `symbol` |
| `ContentType` | `DefinitionContentType`<`ModelTypes`, `Key`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `Key` |
| `did?` | `string` |

#### Returns

`Promise`<``null`` \| `ContentType`\>

#### Defined in

[index.ts:93](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L93)

___

### getDefinition

▸ **getDefinition**(`id`): `Promise`<[`DefinitionWithID`](../modules.md#definitionwithid)<`Record`<`string`, `unknown`\>\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` \| `StreamID` |

#### Returns

`Promise`<[`DefinitionWithID`](../modules.md#definitionwithid)<`Record`<`string`, `unknown`\>\>\>

#### Defined in

[index.ts:259](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L259)

___

### getDefinitionID

▸ **getDefinitionID**(`aliasOrID`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `aliasOrID` | `string` |

#### Returns

`string`

#### Defined in

[index.ts:255](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L255)

___

### getIndex

▸ **getIndex**(`did?`): `Promise`<``null`` \| `IdentityIndex`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did?` | `string` |

#### Returns

`Promise`<``null`` \| `IdentityIndex`\>

#### Defined in

[index.ts:183](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L183)

___

### getRecord

▸ **getRecord**<`ContentType`\>(`definitionID`, `did?`): `Promise`<``null`` \| `ContentType`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ContentType` | `unknown` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `definitionID` | `string` |
| `did?` | `string` |

#### Returns

`Promise`<``null`` \| `ContentType`\>

#### Defined in

[index.ts:279](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L279)

___

### getRecordDocument

▸ **getRecordDocument**(`definitionID`, `did?`): `Promise`<``null`` \| `TileDoc`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `definitionID` | `string` |
| `did?` | `string` |

#### Returns

`Promise`<``null`` \| `TileDoc`\>

#### Defined in

[index.ts:274](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L274)

___

### getRecordID

▸ **getRecordID**(`definitionID`, `did?`): `Promise`<``null`` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `definitionID` | `string` |
| `did?` | `string` |

#### Returns

`Promise`<``null`` \| `string`\>

#### Defined in

[index.ts:269](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L269)

___

### has

▸ **has**(`key`, `did?`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `Alias` |
| `did?` | `string` |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[index.ts:87](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L87)

___

### iterator

▸ **iterator**(`did?`): `AsyncIterableIterator`<[`Entry`](../modules.md#entry)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did?` | `string` |

#### Returns

`AsyncIterableIterator`<[`Entry`](../modules.md#entry)\>

#### Defined in

[index.ts:191](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L191)

___

### merge

▸ **merge**<`Key`, `ContentType`\>(`key`, `content`, `options?`): `Promise`<`StreamID`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Key` | extends `string` \| `number` \| `symbol` |
| `ContentType` | `DefinitionContentType`<`ModelTypes`, `Key`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `Key` |
| `content` | `ContentType` |
| `options?` | [`CreateOptions`](../modules.md#createoptions) |

#### Returns

`Promise`<`StreamID`\>

#### Defined in

[index.ts:114](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L114)

___

### remove

▸ **remove**(`key`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `Alias` |

#### Returns

`Promise`<`void`\>

#### Defined in

[index.ts:174](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L174)

___

### set

▸ **set**<`Key`, `ContentType`\>(`key`, `content`, `options?`): `Promise`<`StreamID`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Key` | extends `string` \| `number` \| `symbol` |
| `ContentType` | `DefinitionContentType`<`ModelTypes`, `Key`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `Key` |
| `content` | `ContentType` |
| `options?` | [`CreateOptions`](../modules.md#createoptions) |

#### Returns

`Promise`<`StreamID`\>

#### Defined in

[index.ts:101](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L101)

___

### setAll

▸ **setAll**<`Contents`\>(`contents`, `options?`): `Promise`<`IdentityIndex`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Contents` | extends `DefinitionsContentTypes`<`ModelTypes`, `Record`<`string`, `unknown`\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `contents` | `Contents` |
| `options?` | [`CreateOptions`](../modules.md#createoptions) |

#### Returns

`Promise`<`IdentityIndex`\>

#### Defined in

[index.ts:125](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L125)

___

### setDefaults

▸ **setDefaults**<`Contents`\>(`contents`, `options?`): `Promise`<`IdentityIndex`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Contents` | extends `DefinitionsContentTypes`<`ModelTypes`, `Record`<`string`, `unknown`\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `contents` | `Contents` |
| `options?` | [`CreateOptions`](../modules.md#createoptions) |

#### Returns

`Promise`<`IdentityIndex`\>

#### Defined in

[index.ts:147](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L147)

___

### setRecord

▸ **setRecord**(`definitionID`, `content`, `options?`): `Promise`<`StreamID`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `definitionID` | `string` |
| `content` | `Record`<`string`, `any`\> |
| `options?` | [`CreateOptions`](../modules.md#createoptions) |

#### Returns

`Promise`<`StreamID`\>

#### Defined in

[index.ts:287](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/did-datastore/src/index.ts#L287)
