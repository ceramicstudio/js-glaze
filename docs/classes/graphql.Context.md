# Class: Context

[graphql](../modules/graphql.md).Context

## Constructors

### constructor

• **new Context**(`params`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ContextParams`](../modules/graphql.md#contextparams) |

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

### loader

• `get` **loader**(): `DocumentLoader`

#### Returns

`DocumentLoader`

___

### query

• `get` **query**(): `QueryAPIs`

#### Returns

`QueryAPIs`

___

### viewerID

• `get` **viewerID**(): ``null`` \| `string`

#### Returns

``null`` \| `string`

## Methods

### createDoc

▸ **createDoc**<`Content`\>(`_model`, `_content`): `Promise`<`ModelInstanceDocument`<`Content`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Content` | `Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `_model` | `string` |
| `_content` | `Content` |

#### Returns

`Promise`<`ModelInstanceDocument`<`Content`\>\>

___

### loadDoc

▸ **loadDoc**<`Content`\>(`id`, `fresh?`): `Promise`<`ModelInstanceDocument`<`Content`\>\>

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

`Promise`<`ModelInstanceDocument`<`Content`\>\>

___

### updateDoc

▸ **updateDoc**<`Content`\>(`_id`, `_content`): `Promise`<`ModelInstanceDocument`<`undefined` \| ``null`` \| `Content`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Content` | `Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `_id` | `string` \| `StreamID` |
| `_content` | `Content` |

#### Returns

`Promise`<`ModelInstanceDocument`<`undefined` \| ``null`` \| `Content`\>\>
