# Module: graphql/src

## Classes

- [Context](../classes/graphql_src.Context.md)
- [GraphQLClient](../classes/graphql_src.GraphQLClient.md)

## Type aliases

### ContextParams

Ƭ **ContextParams**<`ModelTypes`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases` = `ModelTypeAliases` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cache?` | `TileCache` \| `boolean` |
| `ceramic` | `CeramicApi` |
| `loader?` | `TileLoader` |
| `model` | `DataModel`<`ModelTypes`\> \| `ModelTypesToAliases`<`ModelTypes`\> |

___

### GraphQLClientParams

Ƭ **GraphQLClientParams**<`ModelTypes`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases` = `ModelTypeAliases` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cache?` | `TileCache` \| `boolean` |
| `ceramic` | `CeramicApi` |
| `loader?` | `TileLoader` |
| `model` | `DataModel`<`ModelTypes`\> \| `ModelTypesToAliases`<`ModelTypes`\> |
| `schema` | `GraphQLSchema` |

## Functions

### createGraphQLSchema

▸ **createGraphQLSchema**(`params`): `GraphQLSchema`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `CreateSchemaParams` |

#### Returns

`GraphQLSchema`

___

### graphModelToAliases

▸ **graphModelToAliases**<`ModelTypes`\>(`model`): `ModelTypesToAliases`<`ModelTypes`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\> = `ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | `GraphModel` |

#### Returns

`ModelTypesToAliases`<`ModelTypes`\>

___

### printGraphQLSchema

▸ **printGraphQLSchema**(`model`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | `GraphModel` |

#### Returns

`string`
