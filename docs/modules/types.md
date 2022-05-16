# Module: types

Common types used by Glaze packages.

## Interfaces

- [Model](../interfaces/types.Model.md)
- [ModelInstanceDocument](../interfaces/types.ModelInstanceDocument.md)
- [QueryAPIs](../interfaces/types.QueryAPIs.md)

## Type aliases

### CollectionRequest

Ƭ **CollectionRequest**: [`PaginationParams`](types.md#paginationparams) & { `account?`: `string` ; `model`: `string`  }

___

### CollectionResponse

Ƭ **CollectionResponse**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Record`<`string`, `unknown`\> |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `results` | [`ModelInstanceDocument`](../interfaces/types.ModelInstanceDocument.md)<`T`\>[] |
| `total` | `number` |

___

### CompositeDefinitionType

Ƭ **CompositeDefinitionType**<`T`\>: `Object`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `aliases?` | `Record`<`string`, `string`\> |
| `commonEmbeds?` | `string`[] |
| `models` | `Record`<`string`, `T`\> |
| `version` | `string` |
| `views?` | [`CompositeViewsDefinition`](types.md#compositeviewsdefinition) |

___

### CompositeViewsDefinition

Ƭ **CompositeViewsDefinition**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `account` | `any` |
| `models` | `Record`<`string`, [`ReferencedFromViewDefinitions`](types.md#referencedfromviewdefinitions)\> |
| `root` | `any` |

___

### DocumentMetadata

Ƭ **DocumentMetadata**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `controller` | `string` |
| `model` | `string` |

___

### EncodedCompositeDefinition

Ƭ **EncodedCompositeDefinition**: [`CompositeDefinitionType`](types.md#compositedefinitiontype)<[`EncodedStreamCommits`](types.md#encodedstreamcommits)\>

___

### EncodedDagJWS

Ƭ **EncodedDagJWS**: `Object`

JSON-encoded DAG-JWS.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `link?` | `string` |
| `payload` | `string` |
| `signatures` | `JWSSignature`[] |

___

### EncodedDagJWSResult

Ƭ **EncodedDagJWSResult**: `Object`

JSON-encoded DAG-JWS result representing a Ceramic stream commit.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `jws` | [`EncodedDagJWS`](types.md#encodeddagjws) |
| `linkedBlock` | `string` |

___

### EncodedStreamCommits

Ƭ **EncodedStreamCommits**: [`EncodedDagJWSResult`](types.md#encodeddagjwsresult)[]

___

### InternalCompositeDefinition

Ƭ **InternalCompositeDefinition**: [`CompositeDefinitionType`](types.md#compositedefinitiontype)<[`ModelDefinition`](types.md#modeldefinition)\>

___

### LinkRequest

Ƭ **LinkRequest**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `account` | `string` |
| `model` | `string` |

___

### LinkResponse

Ƭ **LinkResponse**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Record`<`string`, `unknown`\> |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `result` | [`ModelInstanceDocument`](../interfaces/types.ModelInstanceDocument.md)<`T`\> \| ``null`` |

___

### ModelAccountRelation

Ƭ **ModelAccountRelation**: ``"list"`` \| ``"set"`` \| ``"link"`` \| ``"none"``

___

### ModelDefinition

Ƭ **ModelDefinition**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accountRelation` | [`ModelAccountRelation`](types.md#modelaccountrelation) |
| `description?` | `string` |
| `name` | `string` |
| `relations?` | [`ModelRelationsDefinition`](types.md#modelrelationsdefinition) |
| `schema` | `JSONSchema.Object` |
| `views?` | [`ModelViewsDefinition`](types.md#modelviewsdefinition) |

___

### ModelRelationDefinition

Ƭ **ModelRelationDefinition**: { `type`: ``"account"``  } \| { `models`: `string`[] ; `type`: ``"document"``  } \| { `type`: ``"setIndex"``  }

___

### ModelRelationsDefinition

Ƭ **ModelRelationsDefinition**: `Record`<`string`, [`ModelRelationDefinition`](types.md#modelrelationdefinition)\>

___

### ModelViewDefinition

Ƭ **ModelViewDefinition**: { `type`: ``"documentAccount"``  } \| { `type`: ``"documentVersion"``  } \| { `property`: `string` ; `type`: ``"referencedBy"``  }

___

### ModelViewsDefinition

Ƭ **ModelViewsDefinition**: `Record`<`string`, [`ModelViewDefinition`](types.md#modelviewdefinition)\>

___

### MultiLinkRequest

Ƭ **MultiLinkRequest**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accounts` | `string`[] |
| `model` | `string` |

___

### MultiLinkResponse

Ƭ **MultiLinkResponse**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Record`<`string`, `unknown`\> |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `results` | `Record`<`string`, [`ModelInstanceDocument`](../interfaces/types.ModelInstanceDocument.md)<`T`\> \| ``null``\> |

___

### PaginationParams

Ƭ **PaginationParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `limit` | `number` |
| `skip?` | `number` |
| `sort?` | ``"asc"`` \| ``"desc"`` |

___

### ReferencedFromViewDefinition

Ƭ **ReferencedFromViewDefinition**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `collection` | `boolean` |
| `model` | `string` |
| `property` | `string` |
| `type` | ``"ReferencedFrom"`` |

___

### ReferencedFromViewDefinitions

Ƭ **ReferencedFromViewDefinitions**: `Record`<`string`, [`ReferencedFromViewDefinition`](types.md#referencedfromviewdefinition)\>

___

### RuntimeBooleanScalar

Ƭ **RuntimeBooleanScalar**: [`RuntimeScalarCommon`](types.md#runtimescalarcommon) & { `type`: ``"boolean"``  }

___

### RuntimeCompositeDefinition

Ƭ **RuntimeCompositeDefinition**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accountStore` | `Record`<`string`, [`RuntimeViewReference`](types.md#runtimeviewreference)\> |
| `models` | `Record`<`string`, `string`\> |
| `objects` | `Record`<`string`, [`RuntimeObjectFields`](types.md#runtimeobjectfields)\> |
| `query?` | `Record`<`string`, [`RuntimeViewReference`](types.md#runtimeviewreference)\> |

___

### RuntimeDIDStringScalar

Ƭ **RuntimeDIDStringScalar**: [`RuntimeScalarCommon`](types.md#runtimescalarcommon) & { `maxLength?`: `number` ; `type`: ``"did"``  }

___

### RuntimeFloatScalar

Ƭ **RuntimeFloatScalar**: [`RuntimeScalarCommon`](types.md#runtimescalarcommon) & { `type`: ``"float"``  }

___

### RuntimeIntegerScalar

Ƭ **RuntimeIntegerScalar**: [`RuntimeScalarCommon`](types.md#runtimescalarcommon) & { `type`: ``"integer"``  }

___

### RuntimeList

Ƭ **RuntimeList**: [`RuntimeScalarCommon`](types.md#runtimescalarcommon) & { `item`: [`RuntimeScalar`](types.md#runtimescalar) \| [`RuntimeReference`](types.md#runtimereference)<``"object"``\> ; `type`: ``"list"``  }

___

### RuntimeObjectField

Ƭ **RuntimeObjectField**: [`RuntimeScalar`](types.md#runtimescalar) \| [`RuntimeList`](types.md#runtimelist) \| [`RuntimeReference`](types.md#runtimereference) \| [`RuntimeViewField`](types.md#runtimeviewfield)

___

### RuntimeObjectFields

Ƭ **RuntimeObjectFields**: `Record`<`string`, [`RuntimeObjectField`](types.md#runtimeobjectfield)\>

___

### RuntimeReference

Ƭ **RuntimeReference**<`T`\>: [`RuntimeScalarCommon`](types.md#runtimescalarcommon) & { `refName`: `string` ; `refType`: `T` ; `type`: ``"reference"``  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`RuntimeReferenceType`](types.md#runtimereferencetype) = [`RuntimeReferenceType`](types.md#runtimereferencetype) |

___

### RuntimeReferenceType

Ƭ **RuntimeReferenceType**: ``"connection"`` \| ``"node"`` \| ``"object"``

___

### RuntimeScalar

Ƭ **RuntimeScalar**: [`RuntimeBooleanScalar`](types.md#runtimebooleanscalar) \| [`RuntimeIntegerScalar`](types.md#runtimeintegerscalar) \| [`RuntimeFloatScalar`](types.md#runtimefloatscalar) \| [`RuntimeStringScalar`](types.md#runtimestringscalar) \| [`RuntimeDIDStringScalar`](types.md#runtimedidstringscalar) \| [`RuntimeStreamRefStringScalar`](types.md#runtimestreamrefstringscalar)

___

### RuntimeScalarCommon

Ƭ **RuntimeScalarCommon**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `required` | `boolean` |

___

### RuntimeScalarType

Ƭ **RuntimeScalarType**: [`RuntimeScalar`](types.md#runtimescalar)[``"type"``]

___

### RuntimeStreamRefStringScalar

Ƭ **RuntimeStreamRefStringScalar**: [`RuntimeScalarCommon`](types.md#runtimescalarcommon) & { `maxLength?`: `number` ; `type`: ``"streamref"``  }

___

### RuntimeStringScalar

Ƭ **RuntimeStringScalar**: [`RuntimeScalarCommon`](types.md#runtimescalarcommon) & { `maxLength?`: `number` ; `type`: ``"string"``  }

___

### RuntimeViewField

Ƭ **RuntimeViewField**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | ``"view"`` |
| `viewType` | [`RuntimeViewType`](types.md#runtimeviewtype) |

___

### RuntimeViewReference

Ƭ **RuntimeViewReference**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `type` | [`RuntimeViewReferenceType`](types.md#runtimeviewreferencetype) |

___

### RuntimeViewReferenceType

Ƭ **RuntimeViewReferenceType**: ``"collection"`` \| ``"model"``

___

### RuntimeViewType

Ƭ **RuntimeViewType**: ``"documentAccount"`` \| ``"documentVersion"``

___

### StreamCommits

Ƭ **StreamCommits**: `DagJWSResult`[]
