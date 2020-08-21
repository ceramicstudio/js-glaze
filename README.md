![IDX header image](https://uploads-ssl.webflow.com/5ebcbef3ac4954196dcdc7b5/5f22e627441c167654b742ba_idp2p.jpg)

# js-idx

[![](https://img.shields.io/badge/Chat%20on-Discord-orange.svg?style=flat)](https://discord.gg/XpBAQtX)

> This project is WIP. Read and contribute to the spec [here](https://www.notion.so/threebox/IDP2P-IDW-2-0-e713338a094a44758ce2c3f21cdce27e).

**js-idx** is a JavaScript library for managing decentralized identities. It provides high-level APIs for interacting with various decentralized identity standards implemented on the Ceramic network such as 3ID DIDs, IDX, profiles, and more.

## Installation

```sh
npm install @ceramicstudio/idx
```

## Example

```ts
import Ceramic from '@ceramicnetwork/ceramic-http-client'
import { IDX } from '@ceramicstudio/idx'
import IdentityWallet from 'identity-wallet'

const ceramic = new Ceramic('http://localhost:7007')
const aliceIndex = new IDX({ ceramic })
const wallet = new IdentityWallet(...)

// IDX instance needs to authenticate using a provider to create Ceramic documents
await aliceIndex.authenticate({ provider: wallet.getDidProvider() })
await aliceIndex.profiles.set('basic', { name: 'Alice' })

// Alice's DID she can share with others
const aliceDID = aliceIndex.did.id

// Another client connecting to Ceramic
const idx = new IDX({ ceramic })
const aliceProfile = await idx.profiles.get(aliceDID, 'basic')
```

## Interfaces and types

### CeramicApi

Ceramic API interface exported by the [`@ceramicnetwork/ceramic-common` library](https://github.com/ceramicnetwork/js-ceramic/tree/develop/packages/ceramic-common)

### DID

`DID` instance exported by the [`dids` library](https://github.com/ceramicnetwork/js-did)

### DIDProvider

DID Provider interface exported by the [`dids` library](https://github.com/ceramicnetwork/js-did)

### Doctype

Doctype interface exported by the [`@ceramicnetwork/ceramic-common` library](https://github.com/ceramicnetwork/js-ceramic/tree/develop/packages/ceramic-common)

### Resolver

`Resolver` instance exported by the [`did-resolver` library](https://github.com/decentralized-identity/did-resolver)

#### Accessors

```ts
interface Accessors {
  list: (id?: string) => Promise<Array<string>>
  get: <T = any>(idOrKey: string, key?: string) => Promise<T>
  set: <T = any>(key: string, value: T) => Promise<void>
  remove: (key: string) => Promise<void>
}
```

### AuthenticateOptions

```ts
interface AuthenticateOptions {
  paths?: Array<string>
  provider?: DIDProvider
}
```

### IDXOptions

```ts
interface IDXOptions {
  ceramic: CeramicApi
  resolver?: ResolverOptions
}
```

## API

### Accessor functions

The following functions are used to interact with a given IDX directory.

#### list

Lists all the keys present in the directory. If the `id` argument is not provided, the authenticated DID is used.

> Calling this function without the `id` argument or an authenticated Ceramic instance will throw an error.

**Arguments**

1. `id?: string`

**Returns** `Promise<Array<string>>`

#### get

Gets the directory content for the given `name`. If the `id` argument is not provided, the authenticated DID is used.

> Calling this function without the `id` argument or an authenticated Ceramic instance will throw an error.

**Arguments**

1. `name: string`
1. `id?: string`

**Returns** `Promise<any>`

#### set

Sets the `content` for the given `name` in the directory owned by the authenticated DID.

> Calling this function without an authenticated Ceramic instance will throw an error.

**Arguments**

1. `name: string`
1. `content: any`

**Returns** `Promise<string>` the document ID

#### remove

Removes the `name` field from the directory of the authenticated DID.

> Calling this function without an authenticated Ceramic instance will throw an error.

**Arguments**

1. `name: string`

**Returns** `Promise<void>`

### IDX class

#### constructor

**Arguments**

1. `options?: IDXOptions`

### .authenticate

**Arguments**

1. `options?: AuthenticateOptions`

**Returns** `Promise<void>`

#### .authenticated

**Returns** `boolean`

#### .ceramic

**Returns** `CeramicApi`

#### .resolver

**Returns** `Resolver`

#### .user

> Accessing this property will throw an error if the instance is not authenticated

**Returns** `DID`

### .accounts

**Returns** `Accessors` for the [Accounts Index](https://github.com/ceramicnetwork/CIP/issues/14)

#### .accounts.list

Lists all the keys present in the directory. If the `id` argument is not provided, the authenticated DID is used.

> Calling this function without the `id` argument or an authenticated Ceramic instance will throw an error.

**Arguments**

1. `id?: string`

**Returns** `Promise<Array<string>>`

#### .accounts.get

Gets the account with the given `name`. If the `id` argument is not provided, the authenticated DID is used.

> Calling this function without the `id` argument or an authenticated Ceramic instance will throw an error.

**Arguments**

1. `name: string`
1. `id?: string`

**Returns** `Promise<any>`

#### .accounts.set

Sets the authenticated DID account `content` for the given `name`.

> Calling this function without an authenticated Ceramic instance will throw an error.

**Arguments**

1. `name: string`
1. `content: any`

**Returns** `Promise<string>` the document ID of the account

#### .accounts.remove

Removes the account with the given `name` from the directory of the authenticated DID.

> Calling this function without an authenticated Ceramic instance will throw an error.

**Arguments**

1. `name: string`

**Returns** `Promise<void>`

### .collections

**Returns** `Accessors` for the [Collections Index](https://github.com/ceramicnetwork/CIP/issues/26)

#### .collections.list

Lists all the collections. If the `id` argument is not provided, the authenticated DID is used.

> Calling this function without the `id` argument or an authenticated Ceramic instance will throw an error.

**Arguments**

1. `id?: string`

**Returns** `Promise<Array<string>>`

#### .collections.get

Gets the collection with the given `name`. If the `id` argument is not provided, the authenticated DID is used.

> Calling this function without the `id` argument or an authenticated Ceramic instance will throw an error.

**Arguments**

1. `name: string`
1. `id?: string`

**Returns** `Promise<any>`

#### .collections.set

Sets the collection `content` for the given `name` in the directory owned by the authenticated DID.

> Calling this function without an authenticated Ceramic instance will throw an error.

**Arguments**

1. `name: string`
1. `content: any`

**Returns** `Promise<string>` the document ID of the collection

#### .collections.remove

Removes the collection with the given `name` field from the directory of the authenticated DID.

> Calling this function without an authenticated Ceramic instance will throw an error.

**Arguments**

1. `name: string`

**Returns** `Promise<void>`

### .profiles

**Returns** `Accessors` for the [Profiles Index](https://github.com/ceramicnetwork/CIP/issues/12)

#### .profiles.list

Lists all the profiles present in the directory. If the `id` argument is not provided, the authenticated DID is used.

> Calling this function without the `id` argument or an authenticated Ceramic instance will throw an error.

**Arguments**

1. `id?: string`

**Returns** `Promise<Array<string>>`

#### .profiles.get

Gets the profile with the given `name`. If the `id` argument is not provided, the authenticated DID is used.

> Calling this function without the `id` argument or an authenticated Ceramic instance will throw an error.

**Arguments**

1. `name: string`
1. `id?: string`

**Returns** `Promise<any>`

#### .profiles.set

Sets the profile `content` for the given `name` in the directory owned by the authenticated DID.

> Calling this function without an authenticated Ceramic instance will throw an error.

**Arguments**

1. `name: string`
1. `content: any`

**Returns** `Promise<string>` the document ID of the profile

#### .profiles.remove

Removes the profile with the `name` field from the directory of the authenticated DID.

> Calling this function without an authenticated Ceramic instance will throw an error.

**Arguments**

1. `name: string`

**Returns** `Promise<void>`

## License

MIT
