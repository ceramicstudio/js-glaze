# Module: devtools-node

Node.js-specific development tools.

## Installation

```sh
npm install --dev @glazed/devtools-node
```

## Type Aliases

### ServeDefinitionParams

Ƭ **ServeDefinitionParams**: [`ServeParams`](devtools_node.md#serveparams) & { `path`: `PathInput`  }

___

### ServeGraphQLParams

Ƭ **ServeGraphQLParams**: [`ServeParams`](devtools_node.md#serveparams) & { `definition`: `RuntimeCompositeDefinition`  }

___

### ServeParams

Ƭ **ServeParams**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `ceramicURL` | `string` | URL of the Ceramic node. |
| `did?` | `DID` | Optional DID instance attached to the Ceramic client. |
| `graphiql?` | `boolean` | Enable GraphiQL on the server. |
| `port?` | `number` \| `number`[] | Port to use, if available. |

___

### ServerHandler

Ƭ **ServerHandler**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `string` | URL of the local GraphQL endpoint. |
| `stop` | (`callback?`: (`err?`: `Error`) => `void`) => `void` | Stop the server. |

## Functions

### createComposite

▸ **createComposite**(`ceramic`, `path`): `Promise`<`Composite`\>

Create a Composite from a GraphQL schema path.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ceramic` | `string` \| `CeramicClient` |
| `path` | `PathInput` |

#### Returns

`Promise`<`Composite`\>

___

### mergeEncodedComposites

▸ **mergeEncodedComposites**(`ceramic`, `source`, `destination`): `Promise`<`string`\>

Merge the encoded `source` composite(s) to the `destination` path.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ceramic` | `string` \| `CeramicClient` |
| `source` | `PathInput` \| `PathInput`[] |
| `destination` | `PathInput` |

#### Returns

`Promise`<`string`\>

___

### readEncodedComposite

▸ **readEncodedComposite**(`ceramic`, `path`): `Promise`<`Composite`\>

Create a Composite from a JSON-encoded definition path.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ceramic` | `string` \| `CeramicClient` |
| `path` | `PathInput` |

#### Returns

`Promise`<`Composite`\>

___

### serveEncodedDefinition

▸ **serveEncodedDefinition**(`params`): `Promise`<[`ServerHandler`](devtools_node.md#serverhandler)\>

Create a local GraphQL server to interact with an encoded composite definition.

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ServeDefinitionParams`](devtools_node.md#servedefinitionparams) |

#### Returns

`Promise`<[`ServerHandler`](devtools_node.md#serverhandler)\>

___

### serveGraphQL

▸ **serveGraphQL**(`params`): `Promise`<[`ServerHandler`](devtools_node.md#serverhandler)\>

Create a local GraphQL server to interact with a runtime composite definition.

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ServeGraphQLParams`](devtools_node.md#servegraphqlparams) |

#### Returns

`Promise`<[`ServerHandler`](devtools_node.md#serverhandler)\>

___

### writeEncodedComposite

▸ **writeEncodedComposite**(`composite`, `path`): `Promise`<`string`\>

Write a JSON-encoded definition for the given composite to the given file path.

#### Parameters

| Name | Type |
| :------ | :------ |
| `composite` | `Composite` |
| `path` | `PathInput` |

#### Returns

`Promise`<`string`\>

___

### writeEncodedCompositeRuntime

▸ **writeEncodedCompositeRuntime**(`ceramic`, `definitionPath`, `runtimePath`, `schemaPath?`): `Promise`<`void`\>

Write the runtime definition based on the encoded definition path.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ceramic` | `string` \| `CeramicClient` |
| `definitionPath` | `PathInput` |
| `runtimePath` | `PathInput` |
| `schemaPath?` | `PathInput` |

#### Returns

`Promise`<`void`\>

___

### writeGraphQLSchema

▸ **writeGraphQLSchema**(`definition`, `path`, `readonly?`): `Promise`<`string`\>

Write the runtime GraphQL schema from the runtime composite definition.

#### Parameters

| Name | Type |
| :------ | :------ |
| `definition` | `RuntimeCompositeDefinition` |
| `path` | `PathInput` |
| `readonly?` | `boolean` |

#### Returns

`Promise`<`string`\>

___

### writeRuntimeDefinition

▸ **writeRuntimeDefinition**(`definition`, `path`): `Promise`<`string`\>

Write the runtime definition for a given path, based on the file extension. Supports `.json`,
`.js` and `.ts` extensions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `definition` | `RuntimeCompositeDefinition` |
| `path` | `PathInput` |

#### Returns

`Promise`<`string`\>
