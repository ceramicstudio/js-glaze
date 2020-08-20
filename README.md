![IDX header image](https://uploads-ssl.webflow.com/5ebcbef3ac4954196dcdc7b5/5f22e627441c167654b742ba_idp2p.jpg)

# js-idx

[![](https://img.shields.io/badge/Chat%20on-Discord-orange.svg?style=flat)](https://discord.gg/XpBAQtX)

> This project is WIP. Read and contribute to the spec [here](https://www.notion.so/threebox/IDP2P-IDW-2-0-e713338a094a44758ce2c3f21cdce27e).

**js-idx** is a JavaScript library for managing decentralized identities. It provides high-level APIs for interacting with various decentralized identity standards implemented on the Ceramic network such as 3ID DIDs, IDX, profiles, and more.

## Installation

```sh
npm install @ceramicstudio/idx
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

Lists all the keys present in the directory. If the `id` argument is not provided, the authenticated user DID is used.

> Calling this function without the `id` argument or an authenticated user will throw an error.

**Arguments**

1. `id?: string`

**Returns** `Promise<Array<string>>`

#### get

Gets the directory content for the given `key`.

This function behaves differently based on the number of arguments provided:

- When 2 arguments are provided, the first one is the `id` and the second one the `key`
- When only 1 argument is provided, it should be the `key` and the authenticated user DID is used.

> Calling this function without the `id` argument or an authenticated user will throw an error.

**Arguments**

1. `idOrKey: string`
1. `key?: string`

**Returns** `Promise<any>`

#### set

Sets the `content` for the given `key` in the directory of the authenticated user.

> Calling this function without an authenticated user will throw an error.

**Arguments**

1. `key: string`
1. `content: any`

**Returns** `Promise<void>`

#### remove

Removes the `key` from the directory of the authenticated user.

> Calling this function without an authenticated user will throw an error.

**Arguments**

1. `key: string`

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

### .collections

**Returns** `Accessors` for the [Collections Index](https://github.com/ceramicnetwork/CIP/issues/26)

### .profiles

**Returns** `Accessors` for the [Profiles Index](https://github.com/ceramicnetwork/CIP/issues/12)

## License

MIT
