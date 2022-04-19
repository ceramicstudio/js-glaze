# Module: types

Common types used by Glaze packages.

## Type aliases

### CastModelTo

Ƭ **CastModelTo**<`Model`, `ToType`\>: `Model` extends [`ModelData`](types.md#modeldata)<`any`\> ? [`MapModelTypes`](types.md#mapmodeltypes)<`Model`, `ToType`\> : [`ModelData`](types.md#modeldata)<`ToType`\>

Utility type for mapping a model structure to a given type.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Model` | extends [`ModelData`](types.md#modeldata)<`any`\> \| `void` |
| `ToType` | `ToType` |

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

### EncodedManagedModel

Ƭ **EncodedManagedModel**: [`ManagedModel`](types.md#managedmodel)<[`EncodedDagJWSResult`](types.md#encodeddagjwsresult)\>

JSON-encoded version of the [`ManagedModel`](types.md#managedmodel), used by the
[`ModelManager`](../classes/devtools.ModelManager.md).

___

### ManagedDoc

Ƭ **ManagedDoc**<`CommitType`\>: `Object`

Shared structure for representing streams used in a [`ManagedModel`](types.md#managedmodel).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `CommitType` | `DagJWSResult` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `alias` | `string` |
| `commits` | `CommitType`[] |
| `version` | `string` |

___

### ManagedEntry

Ƭ **ManagedEntry**<`CommitType`\>: [`ManagedDoc`](types.md#manageddoc)<`CommitType`\> & { `schema`: [`ManagedID`](types.md#managedid)  }

Structure for representing streams having a schema dependency, used in a
[`ManagedModel`](types.md#managedmodel).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `CommitType` | `DagJWSResult` |

___

### ManagedID

Ƭ **ManagedID**: `string`

ID of a stream used in a [`ManagedModel`](types.md#managedmodel).

___

### ManagedModel

Ƭ **ManagedModel**<`CommitType`\>: `Object`

Structure used internally by the [`ModelManager`](../classes/devtools.ModelManager.md) to represent a
data model.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `CommitType` | `DagJWSResult` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `definitions` | `Record`<[`ManagedID`](types.md#managedid), [`ManagedEntry`](types.md#managedentry)<`CommitType`\>\> |
| `schemas` | `Record`<[`ManagedID`](types.md#managedid), [`ManagedSchema`](types.md#managedschema)<`CommitType`\>\> |
| `tiles` | `Record`<[`ManagedID`](types.md#managedid), [`ManagedEntry`](types.md#managedentry)<`CommitType`\>\> |

___

### ManagedSchema

Ƭ **ManagedSchema**<`CommitType`\>: [`ManagedDoc`](types.md#manageddoc)<`CommitType`\> & { `dependencies`: `Record`<`string`, [`ManagedID`](types.md#managedid)[]\>  }

Structure for representing schema streams and their dependencies, used in a
[`ManagedModel`](types.md#managedmodel).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `CommitType` | `DagJWSResult` |

___

### MapModelTypes

Ƭ **MapModelTypes**<`Model`, `ToType`\>: `Object`

Utility type for mapping a model structure of a given type to another.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Model` | extends [`ModelData`](types.md#modeldata)<`any`\> |
| `ToType` | `ToType` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `definitions` | `Record`<keyof `Model`[``"definitions"``], `ToType`\> |
| `schemas` | `Record`<keyof `Model`[``"schemas"``], `ToType`\> |
| `tiles` | `Record`<keyof `Model`[``"tiles"``], `ToType`\> |

___

### ModelAliases

Ƭ **ModelAliases**<`Model`\>: [`CastModelTo`](types.md#castmodelto)<`Model`, `string`\>

Data model aliases created by [`deploying a managed model`](../classes/devtools.ModelManager.md#deploy)
and used at runtime by the [`DataModel`](../classes/datamodel.DataModel.md) class.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Model` | extends [`ModelData`](types.md#modeldata)<`any`\> \| `void` = `void` |

___

### ModelData

Ƭ **ModelData**<`T`\>: `Object`

Generic structure for storing model data.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `definitions` | `Record`<`string`, `T`\> |
| `schemas` | `Record`<`string`, `T`\> |
| `tiles` | `Record`<`string`, `T`\> |

___

### ModelTypeAliases

Ƭ **ModelTypeAliases**<`Schemas`, `Definitions`, `Tiles`\>: `Object`

Model aliases relations between schemas and the definitions and tiles using them.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Schemas` | extends `Record`<`string`, `any`\> = `Record`<`string`, `any`\> |
| `Definitions` | extends `Record`<`string`, keyof `Schemas`\> = `Record`<`string`, `string`\> |
| `Tiles` | extends `Record`<`string`, keyof `Schemas`\> = `Record`<`string`, `string`\> |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `definitions` | `Definitions` |
| `schemas` | `Schemas` |
| `tiles` | `Tiles` |

___

### ModelTypesToAliases

Ƭ **ModelTypesToAliases**<`TypeAliases`\>: [`MapModelTypes`](types.md#mapmodeltypes)<`TypeAliases`, `string`\>

Utility type to cast [`ModelTypeAliases`](types.md#modeltypealiases) to [`ModelAliases`](types.md#modelaliases).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TypeAliases` | extends [`ModelTypeAliases`](types.md#modeltypealiases) |

___

### Schema

Ƭ **Schema**<`T`\>: `JSONSchemaType`<`T`\> & { `$comment?`: `string` ; `title?`: `string`  }

JSON schema declaration, used for validating Ceramic streams.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `Record`<`string`, `any`\> |
