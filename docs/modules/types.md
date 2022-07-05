# Module: types

Common types used by Glaze packages.

## Type Aliases

### CompositeDefinitionType

Ƭ **CompositeDefinitionType**<`T`\>: `Object`

Composite definition type factory, used both for encoded and internal composites definitions.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `aliases?` | `Record`<`string`, `string`\> | Optional mapping of model stream ID to alias name. |
| `commonEmbeds?` | `string`[] | Optional common embeds shared by models in the composite. |
| `models` | `Record`<`string`, `T`\> | Models defined in the composite, keyed by stream ID. |
| `version` | `string` | Version of the composite format. |
| `views?` | [`CompositeViewsDefinition`](types.md#compositeviewsdefinition) | Optional composite-level views. |

___

### CompositeViewsDefinition

Ƭ **CompositeViewsDefinition**: `Object`

Composite-level views definition.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `account?` | `Record`<`string`, `unknown`\> |
| `models?` | `Record`<`string`, `ModelViewsDefinition`\> |
| `root?` | `Record`<`string`, `unknown`\> |

___

### CustomRuntimeScalarType

Ƭ **CustomRuntimeScalarType**: ``"commitid"`` \| ``"did"`` \| ``"id"``

Ceramic-specific runtime scalar types.

___

### EncodedCompositeDefinition

Ƭ **EncodedCompositeDefinition**: [`CompositeDefinitionType`](types.md#compositedefinitiontype)<[`EncodedStreamCommits`](types.md#encodedstreamcommits)\>

JSON-encoded composite definition.

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

JSON-encoded Ceramic stream commits for a given stream.

___

### InternalCompositeDefinition

Ƭ **InternalCompositeDefinition**: [`CompositeDefinitionType`](types.md#compositedefinitiontype)<`ModelDefinition`\>

Composite definition used internally by the [`Composite`](../classes/devtools.Composite.md)
development tools.

___

### RuntimeBooleanScalar

Ƭ **RuntimeBooleanScalar**: [`RuntimeScalarCommon`](types.md#runtimescalarcommon) & { `type`: ``"boolean"``  }

Runtime scalar representation for a boolean.

___

### RuntimeCompositeDefinition

Ƭ **RuntimeCompositeDefinition**: `Object`

Runtime composite definition, used by the [`GraphClient class`](../classes/graph.GraphClient.md) to
create a GraphQL schema to interact with.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `accountData` | `Record`<`string`, [`RuntimeViewReference`](types.md#runtimeviewreference)\> | Account-based relations. |
| `models` | `Record`<`string`, `string`\> | Models names to stream IDs mapping. |
| `objects` | `Record`<`string`, [`RuntimeObjectFields`](types.md#runtimeobjectfields)\> | Objects structures, keyed by name. |
| `query?` | `Record`<`string`, [`RuntimeViewReference`](types.md#runtimeviewreference)\> | Optional query-level entry-points. |

___

### RuntimeFloatScalar

Ƭ **RuntimeFloatScalar**: [`RuntimeScalarCommon`](types.md#runtimescalarcommon) & { `type`: ``"float"``  }

Runtime scalar representation for a float.

___

### RuntimeIntegerScalar

Ƭ **RuntimeIntegerScalar**: [`RuntimeScalarCommon`](types.md#runtimescalarcommon) & { `type`: ``"integer"``  }

Runtime scalar representation for an integer.

___

### RuntimeList

Ƭ **RuntimeList**: [`RuntimeScalarCommon`](types.md#runtimescalarcommon) & { `item`: [`RuntimeScalar`](types.md#runtimescalar) \| [`RuntimeReference`](types.md#runtimereference)<``"object"``\> ; `type`: ``"list"``  }

Runtime list representation.

___

### RuntimeObjectField

Ƭ **RuntimeObjectField**: [`RuntimeScalar`](types.md#runtimescalar) \| [`RuntimeList`](types.md#runtimelist) \| [`RuntimeReference`](types.md#runtimereference) \| [`RuntimeViewField`](types.md#runtimeviewfield)

Runtime object fields representations.

___

### RuntimeObjectFields

Ƭ **RuntimeObjectFields**: `Record`<`string`, [`RuntimeObjectField`](types.md#runtimeobjectfield)\>

Runtime object property name to field representation mapping.

___

### RuntimeReference

Ƭ **RuntimeReference**<`T`\>: [`RuntimeScalarCommon`](types.md#runtimescalarcommon) & { `refName`: `string` ; `refType`: `T` ; `type`: ``"reference"``  }

Runtime reference representation.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`RuntimeReferenceType`](types.md#runtimereferencetype) = [`RuntimeReferenceType`](types.md#runtimereferencetype) |

___

### RuntimeReferenceType

Ƭ **RuntimeReferenceType**: ``"connection"`` \| ``"node"`` \| ``"object"``

Runtime references types.

___

### RuntimeScalar

Ƭ **RuntimeScalar**: [`RuntimeBooleanScalar`](types.md#runtimebooleanscalar) \| [`RuntimeIntegerScalar`](types.md#runtimeintegerscalar) \| [`RuntimeFloatScalar`](types.md#runtimefloatscalar) \| [`RuntimeStringScalar`](types.md#runtimestringscalar) \| `RuntimeStringScalarType`<``"commitid"``\> \| `RuntimeStringScalarType`<``"did"``\> \| `RuntimeStringScalarType`<``"id"``\>

Runtime scalar representations.

___

### RuntimeScalarCommon

Ƭ **RuntimeScalarCommon**: `Object`

Common runtime scalar properties.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `required` | `boolean` |

___

### RuntimeScalarType

Ƭ **RuntimeScalarType**: [`RuntimeScalar`](types.md#runtimescalar)[``"type"``]

Runtime scalar types.

___

### RuntimeStringScalar

Ƭ **RuntimeStringScalar**: [`RuntimeScalarCommon`](types.md#runtimescalarcommon) & { `maxLength?`: `number` ; `type`: ``"string"``  }

Runtime scalar representation for a string.

___

### RuntimeViewField

Ƭ **RuntimeViewField**: `Object`

Runtime view field representation.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | ``"view"`` |
| `viewType` | [`RuntimeViewType`](types.md#runtimeviewtype) |

___

### RuntimeViewReference

Ƭ **RuntimeViewReference**: `Object`

Runtime view reference representation.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `type` | [`RuntimeViewReferenceType`](types.md#runtimeviewreferencetype) |

___

### RuntimeViewReferenceType

Ƭ **RuntimeViewReferenceType**: ``"connection"`` \| ``"node"``

Runtime views types.

___

### RuntimeViewType

Ƭ **RuntimeViewType**: ``"documentAccount"`` \| ``"documentVersion"``

Runtime view types.

___

### StreamCommits

Ƭ **StreamCommits**: `DagJWSResult`[]

Ceramic stream commits for a given stream.
