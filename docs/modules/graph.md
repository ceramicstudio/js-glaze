# Module: graph

Ceramic Graph client.

## Installation

```sh
npm install @glazed/graph
```

## Classes

- [GraphClient](../classes/graph.GraphClient.md)

## Type Aliases

### DocumentCache

Ƭ **DocumentCache**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `clear` | () => `any` |
| `delete` | (`id`: `string`) => `any` |
| `get` | (`id`: `string`) => `void` \| `Promise`<`ModelInstanceDocument`<`Record`<`string`, `any`\>\>\> |
| `set` | (`id`: `string`, `value`: `Promise`<`ModelInstanceDocument`<`Record`<`string`, `any`\>\>\>) => `any` |

___

### GraphClientParams

Ƭ **GraphClientParams**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `cache?` | [`DocumentCache`](graph.md#documentcache) \| `boolean` | Optional cache for documents. |
| `ceramic` | `CeramicApi` \| `string` | Ceramic client instance or HTTP URL. |
| `definition` | `RuntimeCompositeDefinition` | Runtime composite definition, created using the [`Composite`](../classes/devtools.Composite.md) development tools. |

## Functions

### createGraphQLSchema

▸ **createGraphQLSchema**(`params`): `GraphQLSchema`

Create a GraphQL schema from a runtime composite definition

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `CreateSchemaParams` |

#### Returns

`GraphQLSchema`

___

### printGraphQLSchema

▸ **printGraphQLSchema**(`definition`, `readonly?`): `string`

Create a GraphQL schema from a runtime composite definition and return its string
representation.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `definition` | `RuntimeCompositeDefinition` | `undefined` |
| `readonly` | `boolean` | `false` |

#### Returns

`string`
