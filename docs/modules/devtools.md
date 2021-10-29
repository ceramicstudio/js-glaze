# Module: devtools

```sh
npm install --dev @glazed/devtools
```

## Classes

- [ModelManager](../classes/devtools.ModelManager.md)

## Type aliases

### AddModelSchemaOptions

Ƭ **AddModelSchemaOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `name?` | `string` |
| `owner?` | `string` |
| `parent?` | `string` |

## Functions

### createGraphQLModel

▸ **createGraphQLModel**(`manager`): `Promise`<`GraphQLModel`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `manager` | [`ModelManager`](../classes/devtools.ModelManager.md) |

#### Returns

`Promise`<`GraphQLModel`\>

___

### decodeDagJWS

▸ **decodeDagJWS**(`__namedParameters`): `DagJWS`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `EncodedDagJWS` |

#### Returns

`DagJWS`

___

### decodeDagJWSResult

▸ **decodeDagJWSResult**(`__namedParameters`): `DagJWSResult`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `EncodedDagJWSResult` |

#### Returns

`DagJWSResult`

___

### decodeModel

▸ **decodeModel**(`model`): `ManagedModel`<`DagJWSResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | `ManagedModel`<`EncodedDagJWSResult`\> |

#### Returns

`ManagedModel`<`DagJWSResult`\>

___

### encodeDagJWS

▸ **encodeDagJWS**(`__namedParameters`): `EncodedDagJWS`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `DagJWS` |

#### Returns

`EncodedDagJWS`

___

### encodeDagJWSResult

▸ **encodeDagJWSResult**(`__namedParameters`): `EncodedDagJWSResult`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `DagJWSResult` |

#### Returns

`EncodedDagJWSResult`

___

### encodeModel

▸ **encodeModel**(`model`): `ManagedModel`<`EncodedDagJWSResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | `ManagedModel`<`DagJWSResult`\> |

#### Returns

`ManagedModel`<`EncodedDagJWSResult`\>

___

### isSecureSchema

▸ **isSecureSchema**<`T`\>(`schema`): `boolean`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | `UncheckedJSONSchemaType`<`T`, ``false``\> |

#### Returns

`boolean`

___

### publishDataStoreSchemas

▸ **publishDataStoreSchemas**(`ceramic`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ceramic` | `CeramicApi` |

#### Returns

`Promise`<`void`\>

___

### publishEncodedModel

▸ **publishEncodedModel**(`ceramic`, `model`): `Promise`<`PublishedModel`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ceramic` | `CeramicApi` |
| `model` | `EncodedManagedModel` |

#### Returns

`Promise`<`PublishedModel`\>

___

### publishModel

▸ **publishModel**(`ceramic`, `model`): `Promise`<`PublishedModel`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ceramic` | `CeramicApi` |
| `model` | `ManagedModel`<`DagJWSResult`\> |

#### Returns

`Promise`<`PublishedModel`\>

___

### streamIDToString

▸ **streamIDToString**(`id`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` \| `StreamRef` |

#### Returns

`string`
