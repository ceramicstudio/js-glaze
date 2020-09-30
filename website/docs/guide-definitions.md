---
title: Setting up Definitions
---

## Understanding Definitions

In IDX, **Definitions** are needed to access resources. They are used in two main ways:

1. Their [Document Identifier (DocID)](idx-terminology.md#docid) is used a key in the [Identity Index](idx-terminology.md#identity-index--idx) map.
1. Their [Document](idx-terminology.md#document) contents contain metadata describing the resource associated to them

## Definition contents

A **Definition** contains the following metadata:

- `schema` (required): the [DocID](idx-terminology.md#docid) of the [Schema](idx-terminology.md#schema) that will be used to validate the associated resource contents
- `name` (required): a name for the Definition, helping unique identification and discovery
- `description` (optional): a short description of the Definition, to help with discovery
- `url` (optional): URL of the specification for the Definition or associated project
- `config` (optional): any additional contents that may be needed by applications to support additional logic when interacting with the resource

## Creating a Definition using IDX tools

Developers can create **Definitions** specific to their application needs directly by using the [`createDefinition` method](libs-tools.md#createdefinition) of the [`idx-tools`library](libs-tools.md):

```ts
import { createDefinition } from '@ceramicstudio/idx-tools'

const definitionID = await createDefinition(ceramic, {
  name: 'my app definition',
  schema: 'ceramic://...'
})
```

The `definitionID` created here is **immutable** and can be used by other methods of IDX, for example to get and set the contents associated to this definition:

```ts
import { IDX } from '@ceramicstudio/idx'

// See constructor options
const idx = new IDX(...)

await idx.set(definitionID, { my: 'contents' })
await idx.get(definitionID) // { my: 'contents' }
```

## Definition aliases

Rather than using [DocIDs](idx-terminology.md#docid) to identify contents used by apps, it's possible provide a `definitions` record to the `IDX` constructor, to be used in other methods.

### During development

Aliases only need to be **created once** so they are available on the [Ceramic network](idx-terminology.md#ceramic).

```ts
const [userDefinitionID, collectionDefinitionID] = await Promise.all([
  createDefinition(ceramic, {
    name: 'my first definition',
    schema: 'ceramic://...'
  }),
  createDefinition(ceramic, {
    name: 'my second definition',
    schema: 'ceramic://...'
  })
])

const definitions = { user: userDefinitionID, collection: collectionDefinitionID }
```

### Application runtime

A deployed application can use the Definition aliases created during development to identify contents.

```ts
// The definition name to DocID map created during development
const definitions = {...}

// See constructor options
const idx = new IDX({ definitions, ... })

// Definitiona aliases can then be used in IDX methods
const user = await idx.get('user')
await idx.set('collection', { my: 'data' })
```
