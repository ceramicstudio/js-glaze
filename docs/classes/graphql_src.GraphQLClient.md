# Class: GraphQLClient<ModelTypes\>

[graphql/src](../modules/graphql_src.md).GraphQLClient

## Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases` = `ModelTypeAliases` |

## Constructors

### constructor

• **new GraphQLClient**<`ModelTypes`\>(`params`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\> = `ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`GraphQLClientParams`](../modules/graphql_src.md#graphqlclientparams)<`ModelTypes`\> |

## Accessors

### context

• `get` **context**(): [`Context`](graphql_src.Context.md)<`ModelTypes`\>

#### Returns

[`Context`](graphql_src.Context.md)<`ModelTypes`\>

## Methods

### execute

▸ **execute**(`source`, `variableValues?`): `Promise`<`ExecutionResult`<`ObjMap`<`unknown`\>, `ObjMap`<`unknown`\>\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | `string` \| `Source` |
| `variableValues?` | `Record`<`string`, `unknown`\> |

#### Returns

`Promise`<`ExecutionResult`<`ObjMap`<`unknown`\>, `ObjMap`<`unknown`\>\>\>

___

### fromGraph

▸ `Static` **fromGraph**<`ModelTypes`\>(`__namedParameters`): [`GraphQLClient`](graphql_src.GraphQLClient.md)<`ModelTypes`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\> = `ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `FromGraphParams` |

#### Returns

[`GraphQLClient`](graphql_src.GraphQLClient.md)<`ModelTypes`\>
