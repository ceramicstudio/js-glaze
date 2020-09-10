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

## Definitions and Schemas

All [Documents](idx-terminology.md#document) attached to the [Root Index](idx-terminology.md#root-index) need to have [Definion](idx-terminology.md#definition).

Once a public Ceramic network is running, the IDX library will provide a set of Definions that can be used directly, but in the meantime these needs to be defined by developers using IDX.

To create a Defininion, a specific [Schema](idx-terminology.md#schema) needs to be used, and therefore must be present on the Ceramic node used by the IDX instance.
The [`idx-schemas` library](https://github.com/ceramicstudio/js-idx-schemas) can be used to easily publish schemas to the Ceramic node:

```ts
import { schemasList, publishSchemas } from '@ceramicstudio/idx-schemas'

// `ceramic` implements the CeramicApi interface
const schemas = await publishSchemas({ ceramic, schemas: schemasList })
```

The returned `schemas` object should be provided to the `IDX` constructor.

## Example usage

```ts
import { IDX } from '@ceramicstudio/idx'

// `ceramic` implements the CeramicApi interface and `schemas` is created using `publishSchemas` in the code above
const idx = new IDX({ ceramic, schemas })

// Definitions should only be created once during the application development, the following code is for demonstration purpose only
const definitions = {
  'myapp:profile': await idx.createDefinition({
    name: 'MyApp user profile',
    schema: schemas.BasicProfile
  })
}

// A first user (Alice) can set her profile on her Index using the definition alias used by the app
const aliceIndex = new IDX({ ceramic, definitions, schemas })
await aliceIndex.set('myapp:profile', { name: 'Alice' })

// Other users (such as Bob) can read from known Indexes using the same definion alias and Alice's DID
const bobClient = new IDX({ ceramic, definitions, schemas })
const aliceProfile = await bobClient.get('myapp:profile', aliceIndex.id)
```
