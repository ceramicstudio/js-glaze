# Module: did-datastore

```sh
npm install @glazed/did-datastore
```

## Classes

- [DIDDataStore](../classes/did_datastore.DIDDataStore.md)

## Type aliases

### CreateOptions

Ƭ **CreateOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `controller?` | `string` |
| `pin?` | `boolean` |

___

### DIDDataStoreParams

Ƭ **DIDDataStoreParams**<`ModelTypes`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases``ModelTypeAliases` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `autopin?` | `boolean` |
| `ceramic` | `CeramicApi` |
| `id?` | `string` |
| `model` | `DataModel`<`ModelTypes`\> \| `ModelTypesToAliases`<`ModelTypes`\> |

___

### DefinitionContentType

Ƭ **DefinitionContentType**<`ModelTypes`, `Alias`\>: `ModelTypes`[``"schemas"``][`ModelTypes`[``"definitions"``][`Alias`]]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases` |
| `Alias` | extends keyof `ModelTypes`[``"definitions"``] |

___

### DefinitionWithID

Ƭ **DefinitionWithID**<`Config`\>: `Definition`<`Config`\> & { `id`: `StreamID`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Config` | extends `Record`<`string`, `unknown`\>`Record`<`string`, `unknown`\> |

___

### DefinitionsContentTypes

Ƭ **DefinitionsContentTypes**<`ModelTypes`, `Fallback`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ModelTypes` | extends `ModelTypeAliases` |
| `Fallback` | `Record`<`string`, `unknown`\> |

#### Index signature

▪ [Key: `string`]: typeof `Key` extends keyof `ModelTypes`[``"definitions"``] ? [`DefinitionContentType`](did_datastore.md#definitioncontenttype)<`ModelTypes`, typeof `Key`\> : `Fallback`

___

### Entry

Ƭ **Entry**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `key` | `string` |
| `record` | `unknown` |

## Functions

### assertDIDstring

▸ **assertDIDstring**(`did`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`void`

___

### isDIDstring

▸ **isDIDstring**(`did`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`boolean`
