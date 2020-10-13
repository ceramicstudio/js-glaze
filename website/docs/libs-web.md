---
title: IDX Web library
---

:::caution Browser only
IDX Web only targets browser environments, use the [main IDX library](libs-idx.md) instead if you need cross-platform support.
:::

## Installation

```sh
npm install @ceramicstudio/idx-web
```

## Interfaces

### EthereumAuthProvider

Class exported by the [`3id-connect` library](https://github.com/3box/3id-connect)

### ThreeIdConnect

Class exported by the [`3id-connect` library](https://github.com/3box/3id-connect)

### IDXWebOptions

Extends [`IDXOptions`](libs-types.md#idxoptions) from the [`IDX` library](libs-idx.md).

The `Ceramic` instance must be a [Ceramic HTTP Client instance](https://github.com/ceramicnetwork/js-ceramic/tree/develop/packages/ceramic-http-client).

```ts
interface IDXWebOptions extends Omit<IDXOptions, 'ceramic'> {
  ceramic?: Ceramic | string
  connect?: ThreeIdConnect | string
}
```

### EthereumProviderOptions

```ts
interface EthereumProviderOptions {
  address: string
  provider: unknown
}
```

### WebAuthenticateOptions

Extends [`AuthenticateOptions`](libs-types.md#authenticateoptions) from the [`IDX` library](libs-idx.md)

```ts
interface WebAuthenticateOptions extends AuthenticateOptions {
  authProvider?: EthereumAuthProvider
  ethereum?: EthereumProviderOptions
}
```

## IDXWeb class

**Extends** [`IDX`](libs-idx.md#idx-class). The APIs documented below only describe the changes from the extended class.

### constructor

**Arguments**

1. [`options: IDXWebOptions`](#idxweboptions)

### .authenticate

**Arguments**

1. [`options?: WebAuthenticateOptions`](#webauthenticateoptions)

**Returns** `Promise<void>`
