# Class: DIDDataStore<ModelTypes, Alias\>

[did-datastore](../modules/did_datastore.md).DIDDataStore

```sh
import { DIDDataStore } from '@glazed/did-datastore'
```

## Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases` = `ModelTypeAliases` |
| `Alias` | extends keyof `ModelTypes`[``"definitions"``] = keyof `ModelTypes`[``"definitions"``] |

## Constructors

### constructor

• **new DIDDataStore**<`ModelTypes`, `Alias`\>(`params`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\> = `ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\> |
| `Alias` | extends `string` \| `number` \| `symbol` = keyof `ModelTypes`[``"definitions"``] |

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

### loader

• `get` **loader**(): `TileLoader`

#### Returns

`TileLoader`

___

### model

• `get` **model**(): `DataModel`<`ModelTypes`, `ModelTypesToAliases`<`ModelTypes`\>\>

#### Returns

`DataModel`<`ModelTypes`, `ModelTypesToAliases`<`ModelTypes`\>\>

## Methods

### get

▸ **get**<`Key`, `ContentType`\>(`key`, `did?`): `Promise`<``null`` \| `ContentType`\>

Get the record contents.

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

Load and validate a definition by its ID.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` \| `StreamID` |

#### Returns

`Promise`<[`DefinitionWithID`](../modules/did_datastore.md#definitionwithid)<`Record`<`string`, `unknown`\>\>\>

___

### getDefinitionID

▸ **getDefinitionID**(`aliasOrID`): `string`

Get the definition ID for the given alias.

#### Parameters

| Name | Type |
| :------ | :------ |
| `aliasOrID` | `string` |

#### Returns

`string`

___

### getIndex

▸ **getIndex**(`did?`): `Promise`<``null`` \| `IdentityIndex`\>

Load the full index contents.

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`Promise`<``null`` \| `IdentityIndex`\>

___

### getMultiple

▸ **getMultiple**<`Key`, `ContentType`\>(`key`, `dids`): `Promise`<(``null`` \| `ContentType`)[]\>

Get the record contents for multiple DIDs at once.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Key` | extends `string` \| `number` \| `symbol` |
| `ContentType` | [`DefinitionContentType`](../modules/did_datastore.md#definitioncontenttype)<`ModelTypes`, `Key`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `Key` |
| `dids` | `string`[] |

#### Returns

`Promise`<(``null`` \| `ContentType`)[]\>

___

### getRecord

▸ **getRecord**<`ContentType`\>(`definitionID`, `did?`): `Promise`<``null`` \| `ContentType`\>

Load a record contents for the given definition ID.

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

Load a record TileDocument for the given definition ID.

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

Load a record ID in the index for the given definition ID.

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

Returns whether a record exists in the index or not.

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

Asynchronously iterate over the entries of the index, loading one record at a time.

#### Parameters

| Name | Type |
| :------ | :------ |
| `did?` | `string` |

#### Returns

`AsyncIterableIterator`<[`Entry`](../modules/did_datastore.md#entry)\>

___

### merge

▸ **merge**<`Key`, `ContentType`\>(`key`, `content`, `options?`): `Promise`<`StreamID`\>

Perform a shallow (one level) merge of the record contents.

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

### remove

▸ **remove**(`key`, `controller?`): `Promise`<`void`\>

Remove a record from the index.

**Notice**: this *does not* change the contents of the record itself, only the index.

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

Set the record contents.

**Warning**: calling this method replaces any existing contents in the record, use [`merge`](did_datastore.DIDDataStore.md#merge) if you want to only change some fields.

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

Set the contents of multiple records at once.
The index only gets updated after all wanted records have been written.

**Warning**: calling this method replaces any existing contents in the records.

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

Set the contents of multiple records if they are not already set in the index.

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

Set the contents of a record for the given definition ID.

#### Parameters

| Name | Type |
| :------ | :------ |
| `definitionID` | `string` |
| `content` | `Record`<`string`, `any`\> |
| `options` | [`CreateOptions`](../modules/did_datastore.md#createoptions) |

#### Returns

`Promise`<`StreamID`\>
