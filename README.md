![IDX header image](https://camo.githubusercontent.com/05a4ba66c346c7d52bc46ce8526c6a7d3f227880/68747470733a2f2f75706c6f6164732d73736c2e776562666c6f772e636f6d2f3565626362656633616334393534313936646364633762352f3566316565353133316335343165316364623837633132315f69646b7468696e322e6a7067)

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

### ResolverOptions

`ResolverOptions` interface exported by the [`dids` library](https://github.com/ceramicnetwork/js-did)

### DocID

The ID of a Ceramic document.

```ts
type DocID = string
```

### Definition

```ts
interface Definition<T extends Record<string, unknown> = Record<string, unknown>> {
  name: string
  schema: DocID
  description?: string
  url?: string
  config?: T
}
```

### DefinitionsAliases

```ts
type DefinitionsAliases = Record<string, DocID>
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
  definitions?: DefinitionsAliases
  resolver?: ResolverOptions
}
```

## API

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

#### .did

> Accessing this property will throw an error if the instance is not authenticated

**Returns** `DID`

#### .id

> Accessing this property will throw an error if the instance is not authenticated

**Returns** `string`

## License

MIT
