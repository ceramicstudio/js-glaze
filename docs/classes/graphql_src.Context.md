# Class: Context<ModelTypes\>

[graphql/src](../modules/graphql_src.md).Context

## Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases` = `ModelTypeAliases` |

## Constructors

### constructor

• **new Context**<`ModelTypes`\>(`params`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\> = `ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ContextParams`](../modules/graphql_src.md#contextparams)<`ModelTypes`\> |

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

### dataStore

• `get` **dataStore**(): `DIDDataStore`<`ModelTypes`, keyof `ModelTypes`[``"definitions"``]\>

#### Returns

`DIDDataStore`<`ModelTypes`, keyof `ModelTypes`[``"definitions"``]\>

___

### loader

• `get` **loader**(): `TileLoader`

#### Returns

`TileLoader`

___

### viewerID

• `get` **viewerID**(): ``null`` \| `string`

#### Returns

``null`` \| `string`

## Methods

### addListConnectionEdges

▸ **addListConnectionEdges**<`T`\>(`ownerID`, `listKey`, `schema`, `contents`): `Promise`<{ `edges`: `Edge`<`TileDocument`<`T`\>\>[] ; `node`: `TileDocument`<`Record`<`string`, `any`\>\>  }\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `ownerID` | `string` |
| `listKey` | `string` |
| `schema` | `string` |
| `contents` | `T`[] |

#### Returns

`Promise`<{ `edges`: `Edge`<`TileDocument`<`T`\>\>[] ; `node`: `TileDocument`<`Record`<`string`, `any`\>\>  }\>

___

### createDoc

▸ **createDoc**<`Content`\>(`schema`, `content`): `Promise`<`TileDocument`<`Content`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Content` | `Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | `string` |
| `content` | `Content` |

#### Returns

`Promise`<`TileDocument`<`Content`\>\>

___

### getRecordID

▸ **getRecordID**(`aliasOrID`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `aliasOrID` | `string` |

#### Returns

`Promise`<`string`\>

___

### loadDoc

▸ **loadDoc**<`Content`\>(`id`, `fresh?`): `Promise`<`TileDocument`<`Content`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Content` | `Record`<`string`, `any`\> |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `id` | `string` \| `StreamID` \| `CommitID` | `undefined` |
| `fresh` | `boolean` | `false` |

#### Returns

`Promise`<`TileDocument`<`Content`\>\>

___

### loadListConnection

▸ **loadListConnection**(`list`, `args?`): `Promise`<`Connection`<``null`` \| `TileDocument`<`Record`<`string`, `any`\>\>\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `list` | `string`[] |
| `args` | `ConnectionArguments` |

#### Returns

`Promise`<`Connection`<``null`` \| `TileDocument`<`Record`<`string`, `any`\>\>\>\>

___

### updateDoc

▸ **updateDoc**<`Content`\>(`id`, `content`): `Promise`<`TileDocument`<`undefined` \| ``null`` \| `Content`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Content` | `Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` \| `StreamID` |
| `content` | `Content` |

#### Returns

`Promise`<`TileDocument`<`undefined` \| ``null`` \| `Content`\>\>
