[@glazed/devtools](README.md) / Exports

# @glazed/devtools

## Table of contents

### Classes

- [ModelManager](classes/ModelManager.md)

### Type aliases

- [AddModelSchemaOptions](modules.md#addmodelschemaoptions)

### Functions

- [createGraphQLModel](modules.md#creategraphqlmodel)
- [decodeDagJWS](modules.md#decodedagjws)
- [decodeDagJWSResult](modules.md#decodedagjwsresult)
- [decodeModel](modules.md#decodemodel)
- [encodeDagJWS](modules.md#encodedagjws)
- [encodeDagJWSResult](modules.md#encodedagjwsresult)
- [encodeModel](modules.md#encodemodel)
- [isSecureSchema](modules.md#issecureschema)
- [publishDataStoreSchemas](modules.md#publishdatastoreschemas)
- [publishEncodedModel](modules.md#publishencodedmodel)
- [publishModel](modules.md#publishmodel)
- [streamIDToString](modules.md#streamidtostring)

## Type aliases

### AddModelSchemaOptions

Ƭ **AddModelSchemaOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `name?` | `string` |
| `owner?` | `string` |
| `parent?` | `string` |

#### Defined in

[graphql.ts:46](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/graphql.ts#L46)

## Functions

### createGraphQLModel

▸ **createGraphQLModel**(`manager`): `Promise`<`GraphQLModel`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `manager` | [`ModelManager`](classes/ModelManager.md) |

#### Returns

`Promise`<`GraphQLModel`\>

#### Defined in

[graphql.ts:117](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/graphql.ts#L117)

___

### decodeDagJWS

▸ **decodeDagJWS**(`__namedParameters`): `DagJWS`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `EncodedDagJWS` |

#### Returns

`DagJWS`

#### Defined in

[encoding.ts:8](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/encoding.ts#L8)

___

### decodeDagJWSResult

▸ **decodeDagJWSResult**(`__namedParameters`): `DagJWSResult`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `EncodedDagJWSResult` |

#### Returns

`DagJWSResult`

#### Defined in

[encoding.ts:16](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/encoding.ts#L16)

___

### decodeModel

▸ **decodeModel**(`model`): `ManagedModel`<`DagJWSResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | `ManagedModel`<`EncodedDagJWSResult`\> |

#### Returns

`ManagedModel`<`DagJWSResult`\>

#### Defined in

[encoding.ts:45](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/encoding.ts#L45)

___

### encodeDagJWS

▸ **encodeDagJWS**(`__namedParameters`): `EncodedDagJWS`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `DagJWS` |

#### Returns

`EncodedDagJWS`

#### Defined in

[encoding.ts:12](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/encoding.ts#L12)

___

### encodeDagJWSResult

▸ **encodeDagJWSResult**(`__namedParameters`): `EncodedDagJWSResult`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `DagJWSResult` |

#### Returns

`EncodedDagJWSResult`

#### Defined in

[encoding.ts:20](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/encoding.ts#L20)

___

### encodeModel

▸ **encodeModel**(`model`): `ManagedModel`<`EncodedDagJWSResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | `ManagedModel`<`DagJWSResult`\> |

#### Returns

`ManagedModel`<`EncodedDagJWSResult`\>

#### Defined in

[encoding.ts:62](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/encoding.ts#L62)

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
| `schema` | `JSONSchemaType`<`T`\> |

#### Returns

`boolean`

#### Defined in

[validation.ts:12](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/validation.ts#L12)

___

### publishDataStoreSchemas

▸ **publishDataStoreSchemas**(`ceramic`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ceramic` | `CeramicApi` |

#### Returns

`Promise`<`void`\>

#### Defined in

[datamodel.ts:42](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L42)

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

#### Defined in

[datamodel.ts:86](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L86)

___

### publishModel

▸ **publishModel**(`ceramic`, `model`): `Promise`<`PublishedModel`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ceramic` | `CeramicApi` |
| `model` | `ManagedModel` |

#### Returns

`Promise`<`PublishedModel`\>

#### Defined in

[datamodel.ts:51](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/datamodel.ts#L51)

___

### streamIDToString

▸ **streamIDToString**(`id`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `StreamRef` \| `string` |

#### Returns

`string`

#### Defined in

[utils.ts:3](https://github.com/ceramicstudio/js-idx/blob/53dfead/packages/devtools/src/utils.ts#L3)
