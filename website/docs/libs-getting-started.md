---
title: Getting Started
---

## Environment

IDX needs to access the Ceramic network using an implementation of the Ceramic API as exported by the [`@ceramicnetwork/ceramic-common` library](https://github.com/ceramicnetwork/js-ceramic/tree/develop/packages/ceramic-common).

Packages implementing this interface include [`@ceramicnetwork/ceramic-core`](https://github.com/ceramicnetwork/js-ceramic/tree/develop/packages/ceramic-core) and [`@ceramicnetwork/ceramic-http-client`](https://github.com/ceramicnetwork/js-ceramic/tree/develop/packages/ceramic-http-client).

## Installation

There are two main libraries to use when building apps for IDX

### IDX client library

This library is used by apps to interact with Ceramic and IDX documents

```sh
npm install @ceramicstudio/idx
```

### IDX tools library

This library contains tools for developers to help create the data models used by apps

```sh
npm install --dev @ceramicstudio/idx-tools
```

## Definitions and Schemas

All [Documents](idx-terminology.md#document) attached to the [Identity Index](idx-terminology.md#identity-index--idx) need to have [Definition](idx-terminology.md#definition).

Once a public Ceramic network is running, the IDX library will provide a set of Definitions that can be used directly, but in the meantime these needs to be defined by developers using IDX.

To create a Defininition, a specific [Schema](idx-terminology.md#schema) needs to be used, and therefore must be present on the Ceramic node used by the IDX instance.
The [`idx-tools` library](https://github.com/ceramicstudio/js-idx-tools) can be used to easily publish schemas to the Ceramic node:

```ts
import { publishIDXConfig } from '@ceramicstudio/idx-tools'

// First we need to make sure the IDX config (definitions and schemas) are published on the Ceramic node
// Here `ceramic` implements the CeramicApi interface
const { definitions } = await publishIDXConfig(ceramic)

const appDefinitions = {
  profile: definitions.basicProfile
}

// Export the created `appDefinitions` so they can be used at runtime
```

## Example usage

```ts
import { IDX } from '@ceramicstudio/idx'

// Import definitions created during development or build time
import { definitions } from './app-definitions'

// A first user (Alice) can set her profile on her IDX Document using the definition alias used by the app
const aliceIndex = new IDX({ ceramic, definitions })
await aliceIndex.set('profile', { name: 'Alice' })

// Other users (such as Bob) can read from known Indexes using the same definion alias and Alice's DID
const bobClient = new IDX({ ceramic, definitions })
const aliceProfile = await bobClient.get('profile', aliceIndex.id)
```
