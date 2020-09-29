---
title: Getting Started
---

## Environment

IDX needs to access the Ceramic network using an implementation of the Ceramic API as exported by the [`@ceramicnetwork/ceramic-common` library](https://github.com/ceramicnetwork/js-ceramic/tree/develop/packages/ceramic-common).

Packages implementing this interface include [`@ceramicnetwork/ceramic-core`](https://github.com/ceramicnetwork/js-ceramic/tree/develop/packages/ceramic-core) and [`@ceramicnetwork/ceramic-http-client`](https://github.com/ceramicnetwork/js-ceramic/tree/develop/packages/ceramic-http-client).

## Installation

The IDX library can be installed from npm:

```sh
npm install @ceramicstudio/idx
```

TODO: install idx-tools

## Definitions and Schemas

All [Documents](idx-terminology.md#document) attached to the [Identity Index](idx-terminology.md#identity-index--idx) need to have [Definion](idx-terminology.md#definition).

Once a public Ceramic network is running, the IDX library will provide a set of Definions that can be used directly, but in the meantime these needs to be defined by developers using IDX.

To create a Defininion, a specific [Schema](idx-terminology.md#schema) needs to be used, and therefore must be present on the Ceramic node used by the IDX instance.
The [`idx-tools` library](https://github.com/ceramicstudio/js-idx-tools) can be used to easily publish schemas to the Ceramic node:

```ts
import { publishIDXConfig, publishDefinition } from '@ceramicstudio/idx-tools'

// `ceramic` implements the CeramicApi interface
const { definitions, schemas } = await publishIDXConfig(ceramic)

const appDefinitions = {
  profile: definition.basicProfile,
  documents: await publishDefinition({
    name: 'My app documents',
    schema: schemas.DocIdMap
  })
}

// export the created appDefinitions so they can be used at runtime
```

TODO: show usage of appDefinitions defined above

## Example usage

```ts
import { IDX } from '@ceramicstudio/idx'

// import definitions created during development or build time
import { definitions } from './app-definitions'

// A first user (Alice) can set her profile on her Index using the definition alias used by the app
const aliceIndex = new IDX({ ceramic, definitions })
await aliceIndex.set('profile', { name: 'Alice' })

// Other users (such as Bob) can read from known Indexes using the same definion alias and Alice's DID
const bobClient = new IDX({ ceramic, definitions })
const aliceProfile = await bobClient.get('profile', aliceIndex.id)
```
