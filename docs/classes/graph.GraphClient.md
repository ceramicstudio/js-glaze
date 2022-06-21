# Class: GraphClient

[graph](../modules/graph.md).GraphClient

The GraphClient class provides APIs to execute queries on a GraphQL schema generated from a
[`RuntimeCompositeDefinition`](../modules/types.md#runtimecompositedefinition). It allows applications
to interact with documents using known models on a Ceramic node.

It is exported by the [`graph`](../modules/graph.md) module.

```sh
import { GraphClient } from '@glazed/graph'
```

## Constructors

### constructor

• **new GraphClient**(`params`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`GraphClientParams`](../modules/graph.md#graphclientparams) |

## Accessors

### context

• `get` **context**(): `Context`

Context instance used internally.

#### Returns

`Context`

___

### did

• `get` **did**(): `undefined` \| `DID`

DID instance used internally by the Ceramic client instance.

#### Returns

`undefined` \| `DID`

___

### id

• `get` **id**(): `undefined` \| `string`

ID of the DID attached to the Ceramic client instance used internally. If `undefined`, the
Ceramic instance is not authenticated and mutations will fail.

#### Returns

`undefined` \| `string`

___

### resources

• `get` **resources**(): `string`[]

CACAO resources URLs for the models the client interacts with.

#### Returns

`string`[]

## Methods

### execute

▸ **execute**(`document`, `variableValues?`): `Promise`<`ExecutionResult`<`ObjMap`<`unknown`\>, `ObjMap`<`unknown`\>\>\>

Execute a GraphQL query from a DocumentNode and optional variables.

#### Parameters

| Name | Type |
| :------ | :------ |
| `document` | `DocumentNode` |
| `variableValues?` | `Record`<`string`, `unknown`\> |

#### Returns

`Promise`<`ExecutionResult`<`ObjMap`<`unknown`\>, `ObjMap`<`unknown`\>\>\>

___

### executeQuery

▸ **executeQuery**(`source`, `variableValues?`): `Promise`<`ExecutionResult`<`ObjMap`<`unknown`\>, `ObjMap`<`unknown`\>\>\>

Execute a GraphQL query from its source and optional variables.

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | `string` \| `Source` |
| `variableValues?` | `Record`<`string`, `unknown`\> |

#### Returns

`Promise`<`ExecutionResult`<`ObjMap`<`unknown`\>, `ObjMap`<`unknown`\>\>\>

___

### setDID

▸ **setDID**(`did`): `void`

Attach the given DID instance to the Ceramic client instance used internally. An authenticated
DID instance is necessary to perform GraphQL mutations.

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `DID` |

#### Returns

`void`
