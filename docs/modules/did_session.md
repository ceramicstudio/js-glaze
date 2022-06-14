# Module: did-session

Manages user account and DID in web based environments.

## Purpose

Manages, creates and authorizes a DID session key for a user. Returns an authenticated DIDs instance
to be used in other Ceramic libraries. Supports did:pkh for blockchain accounts with Sign-In with
Ethereum and CACAO for authorization.

## Installation

```sh
npm install @glazed/did-session
```

## Usage

Create an instance, authorize and use DIDs where needed. At the moment, only Ethereum accounts
are supported with the EthereumAuthProvider. Additional accounts will be supported in the future.

```ts
import { DIDSession } from '@glazed/did-session'
import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'

const ethProvider = // import/get your web3 eth provider
const addresses = await ethProvider.enable()
const authProvider = new EthereumAuthProvider(ethProvider, addresses[0])

const session = new DIDSession({ authProvider })
const did = await session.authorize()

// Uses DIDs in ceramic & glaze libraries, ie
const ceramic = new CeramicClient()
ceramic.did = did

// pass ceramic instance where needed

```

## Classes

- [DIDSession](../classes/did_session.DIDSession.md)

## Type aliases

### SessionParams

Ƭ **SessionParams**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `authProvider` | `EthereumAuthProvider` | An authProvider for the chain you wish to support, only ETH supported at moment |

## Functions

### createDIDKey

▸ **createDIDKey**(`seed?`): `Promise`<`DID`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `seed?` | `Uint8Array` |

#### Returns

`Promise`<`DID`\>
