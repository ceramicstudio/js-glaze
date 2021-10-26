# Class: DIDDataStore<ModelTypes, Alias\>

[did-datastore](../modules/did_datastore.md).DIDDataStore

```sh
import { DIDDataStore } from '@glazed/did-datastore'
```

## Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases``ModelTypeAliases` |
| `Alias` | extends keyof `ModelTypes`[``"definitions"``]keyof `ModelTypes`[``"definitions"``] |

## Constructors

### constructor

• **new DIDDataStore**<`ModelTypes`, `Alias`\>(`params`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\>`ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\> |
| `Alias` | extends `string` \| `number` \| `symbol`keyof `ModelTypes`[``"definitions"``] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`DIDDataStoreParams`](../modules/did_datastore.md#diddatastoreparams)<`ModelTypes`\> |

## Accessors

### authenticated

• `get` **authenticated**(): `boolean`

#### Returns

`boolean`

___

### ceramic

• `get` **ceramic**(): `CeramicApi`

#### Returns

`CeramicApi`

___

### id

• `get` **id**(): `string`

#### Returns

`string`

___

### model

• `get` **model**(): `DataModel`<`ModelTypes`, `ModelTypesToAliases`<`ModelTypes`\>\>

#### Returns

`DataModel`<`ModelTypes`, `ModelTypesToAliases`<`ModelTypes`\>\>

## Methods

### get

▸ **get**<`Key`, `ContentType`\>(`key`, `did?`): `Promise`<``null`` \| `ContentType`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Key` | extends `string` \| `number` \| `symbol` |
| `ContentType` | [`DefinitionContentType`](../modules/did_datastore.md#definitioncontenttype)<`ModelTypes`, `Key`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `Key` |
| `did?` | `string` |

#### Returns

`Promise`<``null`` \| `ContentType`\>

___

### getDefinition

▸ **getDefinition**(`id`): `Promise`<[`DefinitionWithID`](../modules/did_datastore.md#definitionwithid)<`Record`<`string`, `unknown`\>\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` \| `StreamID` |

#### Returns

`Promise`<[`DefinitionWithID`](../modules/did_datastore.md#definitionwithid)<`Record`<`string`, `unknown`\>\>\>

___

### getDefinitionID

▸ **getDefinitionID**(`aliasOrID`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `aliasOrID` | `string` |

#### Returns

`string`

___

### getIndex

▸ **getIndex**(`did?`): `Promise`<``null`` \| `IdentityIndex`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`Promise`<``null`` \| `IdentityIndex`\>

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

___

### iterator

▸ **iterator**(`did?`): `AsyncIterableIterator`<[`Entry`](../modules/did_datastore.md#entry)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did?` | `string` |

#### Returns

`AsyncIterableIterator`<[`Entry`](../modules/did_datastore.md#entry)\>

___

### merge

▸ **merge**<`Key`, `ContentType`\>(`key`, `content`, `options?`): `Promise`<`StreamID`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Key` | extends `string` \| `number` \| `symbol` |
| `ContentType` | [`DefinitionContentType`](../modules/did_datastore.md#definitioncontenttype)<`ModelTypes`, `Key`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `Key` |
| `content` | `ContentType` |
| `options?` | [`CreateOptions`](../modules/did_datastore.md#createoptions) |

#### Returns

`Promise`<`StreamID`\>

___

### remove

▸ **remove**(`key`, `controller?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `Alias` |
| `controller` | `string` |

#### Returns

`Promise`<`void`\>

___

### set

▸ **set**<`Key`, `ContentType`\>(`key`, `content`, `options?`): `Promise`<`StreamID`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Key` | extends `string` \| `number` \| `symbol` |
| `ContentType` | [`DefinitionContentType`](../modules/did_datastore.md#definitioncontenttype)<`ModelTypes`, `Key`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `Key` |
| `content` | `ContentType` |
| `options` | [`CreateOptions`](../modules/did_datastore.md#createoptions) |

#### Returns

`Promise`<`StreamID`\>

___

### setAll

▸ **setAll**<`Contents`\>(`contents`, `options?`): `Promise`<`IdentityIndex`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Contents` | extends [`DefinitionsContentTypes`](../modules/did_datastore.md#definitionscontenttypes)<`ModelTypes`, `Record`<`string`, `unknown`\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `contents` | `Contents` |
| `options` | [`CreateOptions`](../modules/did_datastore.md#createoptions) |

#### Returns

`Promise`<`IdentityIndex`\>

___

### setDefaults

▸ **setDefaults**<`Contents`\>(`contents`, `options?`): `Promise`<`IdentityIndex`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Contents` | extends [`DefinitionsContentTypes`](../modules/did_datastore.md#definitionscontenttypes)<`ModelTypes`, `Record`<`string`, `unknown`\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `contents` | `Contents` |
| `options` | [`CreateOptions`](../modules/did_datastore.md#createoptions) |

#### Returns

`Promise`<`IdentityIndex`\>

___

### setRecord

▸ **setRecord**(`definitionID`, `content`, `options?`): `Promise`<`StreamID`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `definitionID` | `string` |
| `content` | `Record`<`string`, `any`\> |
| `options` | [`CreateOptions`](../modules/did_datastore.md#createoptions) |

#### Returns

`Promise`<`StreamID`\>
