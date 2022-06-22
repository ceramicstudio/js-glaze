# Class: Context

[graph](../modules/graph.md).Context

GraphQL execution context, exported by the [`graph`](../modules/graph.md) module.

```sh
import { Context } from '@glazed/graph'
```

## Constructors

### constructor

• **new Context**(`params`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ContextParams`](../modules/graph.md#contextparams) |

## Accessors

### authenticated

• `get` **authenticated**(): `boolean`

Returns whether the Ceramic client instance used internally is authenticated or not. When not
authenticated, mutations will fail.

#### Returns

`boolean`

___

### ceramic

• `get` **ceramic**(): `CeramicApi`

Ceramic client instance used internally.

#### Returns

`CeramicApi`

___

### loader

• `get` **loader**(): `DocumentLoader`

Document loader instance used internally.

#### Returns

`DocumentLoader`

___

### viewerID

• `get` **viewerID**(): ``null`` \| `string`

ID of the current viewer (authenticated DID), if set.

#### Returns

``null`` \| `string`

## Methods

### createDoc

▸ **createDoc**<`Content`\>(`model`, `content`): `Promise`<`ModelInstanceDocument`<`Content`\>\>

Create a new document with the given model and content.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Content` | `Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | `string` |
| `content` | `Content` |

#### Returns

`Promise`<`ModelInstanceDocument`<`Content`\>\>

___

### loadDoc

▸ **loadDoc**<`Content`\>(`id`, `fresh?`): `Promise`<`ModelInstanceDocument`<`Content`\>\>

Load a document by ID, using the cache if possible.

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

### queryConnection

▸ **queryConnection**(`query`): `Promise`<`Connection`<`ModelInstanceDocument`<`Record`<`string`, `any`\>\>\>\>

Query the index for a connection of documents.

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `ConnectionQuery` |

#### Returns

`Promise`<`Connection`<`ModelInstanceDocument`<`Record`<`string`, `any`\>\>\>\>

___

### querySingle

▸ **querySingle**(`query`): `Promise`<``null`` \| `ModelInstanceDocument`<`Record`<`string`, `any`\>\>\>

Query the index for a single document.

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `BaseQuery` |

#### Returns

`Promise`<``null`` \| `ModelInstanceDocument`<`Record`<`string`, `any`\>\>\>

___

### updateDoc

▸ **updateDoc**<`Content`\>(`id`, `content`): `Promise`<`ModelInstanceDocument`<``null`` \| `Content`\>\>

Update an existing document.

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

`Promise`<`ModelInstanceDocument`<``null`` \| `Content`\>\>
