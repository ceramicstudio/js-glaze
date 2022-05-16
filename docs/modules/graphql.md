# Module: graphql

GraphQL client

## Classes

- [Context](../classes/graphql.Context.md)
- [GraphQLClient](../classes/graphql.GraphQLClient.md)

## Type aliases

### ContextParams

Ƭ **ContextParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cache?` | `DocumentCache` \| `boolean` |
| `ceramic` | `CeramicApi` |
| `loader?` | `DocumentLoader` |

___

### GraphQLClientParams

Ƭ **GraphQLClientParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cache?` | `DocumentCache` \| `boolean` |
| `ceramic` | `CeramicApi` |
| `loader?` | `DocumentLoader` |
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

### printGraphQLSchema

▸ **printGraphQLSchema**(`definition`, `readonly?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `definition` | `RuntimeCompositeDefinition` | `undefined` |
| `readonly` | `boolean` | `false` |

#### Returns

`string`
