# Class: GraphQLClient

[graphql](../modules/graphql.md).GraphQLClient

## Constructors

### constructor

• **new GraphQLClient**(`params`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`GraphQLClientParams`](../modules/graphql.md#graphqlclientparams) |

## Accessors

### context

• `get` **context**(): [`Context`](graphql.Context.md)

#### Returns

[`Context`](graphql.Context.md)

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

### fromDefinition

▸ `Static` **fromDefinition**(`__namedParameters`): [`GraphQLClient`](graphql.GraphQLClient.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `FromDefinitionParams` |

#### Returns

[`GraphQLClient`](graphql.GraphQLClient.md)
