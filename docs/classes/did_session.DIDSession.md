# Class: DIDSession

[did-session](../modules/did_session.md).DIDSession

DID Session

```sh
import { DIDSession } from '@glazed/did-session'
```

## Constructors

### constructor

• **new DIDSession**(`params`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`SessionParams`](../modules/did_session.md#sessionparams) |

## Accessors

### authProvider

• `get` **authProvider**(): `EthereumAuthProvider`

Get authProvider

#### Returns

`EthereumAuthProvider`

___

### id

• `get` **id**(): `string`

DID string associated to the session instance. session.id == session.getDID().parent

#### Returns

`string`

## Methods

### authorize

▸ **authorize**(`capabilityOpts?`): `Promise`<`DID`\>

Request authorization for session

#### Parameters

| Name | Type |
| :------ | :------ |
| `capabilityOpts` | `CapabilityOpts` |

#### Returns

`Promise`<`DID`\>

___

### getDID

▸ **getDID**(): `DID`

Get DID instance, if authorized

#### Returns

`DID`
