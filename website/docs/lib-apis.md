---
title: APIs
---

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

The [ID](idx-terminology.md#docid) of a [Ceramic Document](idx-terminology.md#document)

```ts
type DocID = string
```

### Definition

A [Definition](idx-terminology.md#definition) is a [Ceramic Document](idx-terminology.md#document) describing a resource in the [Root Index](idx-terminology.md#root-index)

```ts
interface Definition<T = unknown> {
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

### Entry

An [entry](idx-terminology.md#entry) in the [Root Index](idx-terminology.md#root-index)

```ts
interface Entry {
  tags: Array<string>
  ref: DocID
}
```

### DefinitionEntry

```ts
interface DefinitionEntry extends Entry {
  def: DocID
}
```

### ContentEntry

```ts
interface ContentEntry extends DefinitionEntry {
  content: unknown
}
```

### RootIndexContent

Represents the shape of the content stored in the [Root Index](idx-terminology.md#root-index)

```ts
type RootIndexContent = Record<DocID, Entry>
```

### SchemaType

```ts
type SchemaType =
  | 'BasicProfile'
  | 'Definition'
  | 'DocIdDocIdMap'
  | 'DocIdMap'
  | 'RootIndex'
  | 'StringMap'
```

### SchemasAliases

```ts
type SchemasAliases = Record<SchemaType, DocID>
```

### IDXOptions

Options used by the [IDX class constructor](#constructor)

```ts
interface IDXOptions {
  ceramic: CeramicApi
  definitions?: DefinitionsAliases
  resolver?: ResolverOptions
  schemas: SchemasAliases
}
```

### AuthenticateOptions

Options used by the [`authenticate` method](#authenticate) of the `IDX` class

```ts
interface AuthenticateOptions {
  paths?: Array<string>
  provider?: DIDProvider
}
```

### ContentIteratorOptions

Options used by the [`contentIterator` method](#contentiterator) of the `IDX` class

```ts
interface ContentIteratorOptions {
  did?: string
  tag?: string
}
```

## IDX class

### constructor

**Arguments**

1. [`options: IDXOptions`](#idxoptions)

### .authenticate

**Arguments**

1. [`options?: AuthenticateOptions`](#authenticateoptions)

**Returns** `Promise<void>`

### .authenticated

**Returns** `boolean`

### .ceramic

**Returns** [`CeramicApi`](#ceramicapi)

### .resolver

**Returns** [`Resolver`](#resolver)

### .did

> Accessing this property will throw an error if the instance is not authenticated

**Returns** [`DID`](#did)

### .id

> Accessing this property will throw an error if the instance is not authenticated

**Returns** `string`

### .has

Returns whether an entry with the `name` alias or definition [`DocID`](#docid) exists in the [Root Index](idx-terminology.md#root-index) of the specified `did`

**Arguments**

1. `name: string | DocID`
1. `did?: string = this.id`

**Returns** `Promise<boolean>`

### .get

Returns the referenced content for the given `name` alias or definition [`DocID`](#docid) of the specified `did`

**Arguments**

1. `name: string | DocID`
1. `did?: string = this.id`

**Returns** `Promise<unknown>`

### .set

Sets the content for the given `name` alias or definition [`DocID`](#docid) in the [Root Index](idx-terminology.md#root-index) of the authenticated [DID](idx-terminology.md#did)

**Arguments**

1. `name: string | DocID`
1. `content: unknown`

**Returns** `Promise<DocID>` the [`DocID`](#docid) of the created content document

### .addTag

Adds a tag for the given `name` alias or definition [`DocID`](#docid) in the [Root Index](idx-terminology.md#root-index) of the authenticated [DID](idx-terminology.md#did)

**Arguments**

1. `name: string | DocID`
1. `tag: string`

**Returns** `Promise<Array<string>>` the updated set of tags

### .removeTag

Removes a tag for the given `name` alias or definition [`DocID`](#docid) in the [Root Index](idx-terminology.md#root-index) of the authenticated [DID](idx-terminology.md#did)

**Arguments**

1. `name: string | DocID`
1. `tag: string`

**Returns** `Promise<Array<string>>` the updated set of tags

### .remove

Removes the definition for the `name` alias or definition [`DocID`](#docid) in the [Root Index](idx-terminology.md#root-index) of the authenticated [DID](idx-terminology.md#did)

**Arguments**

1. `name: string | DocID`

**Returns** `Promise<void>`

### .getIDXDocID

Returns the [`DocID`](#docid) of the [Root Index](idx-terminology.md#root-index) associated to the given `did`

**Arguments**

1. `did: string`

**Returns** `Promise<DocID | null>`

### .getIDXContent

Returns the [contents](#rootindexcontent) of the [Root Index](idx-terminology.md#root-index) associated to the given `did`

**Arguments**

1. `did?: string = this.id`

**Returns** `Promise<RootIndexContent | null>`

### .createDefinition

Creates a new [Definition](#definition) and returns the created [`DocID`](#docid), to be used to add resources to the [Root Index](idx-terminology.md#root-index)

**Arguments**

1. `definition: Definition`

**Returns** `Promise<DocID>`

### .getDefinition

Loads an existing [Definition](#definition) by its [`DocID`](#docid)

**Arguments**

1. `id: DocID`

**Returns** `Promise<Definition>`

### .getEntryContent

Returns the contents of the [Entry](#entry) for the given [Definition](#definition) [`DocID`](#docid) if present in the [Root Index](idx-terminology.md#root-index) of the given `did`

**Arguments**

1. `definitionId: DocID`
1. `did?: string = this.id`

**Returns** `Promise<unknown | null>`

### .getEntryTags

Returns set of tags of the [Entry](#entry) for the given [Definition](#definition) [`DocID`](#docid) if present in the [Root Index](idx-terminology.md#root-index) of the given `did`

**Arguments**

1. `definitionId: DocID`
1. `did?: string = this.id`

**Returns** `Promise<Array<string>>`

### .setEntryContent

Sets the content of the entry reference.

> The provided tags will only be set if the entry is getting created, if it already exists tags will not be changed

**Arguments**

1. `definitionId: DocID`
1. `content: unknown`
1. `tags?: Array<string> = []`

**Returns** `Promise<DocID>` the [`DocID`](#docid) of the created content document

### .addEntryTag

**Arguments**

1. `definitionid: DocID`
1. `tag: string`

**Returns** `Promise<Array<string>>` the updated set of tags

### .removeEntryTag

**Arguments**

1. `definitionId: DocID`
1. `tag: string`

**Returns** `Promise<Array<string>>` the updated set of tags

### .removeEntry

**Arguments**

1. `definitionId: DocID`

**Returns** `Promise<void>`

### .getEntries

**Arguments**

1. `did?: string = this.id`

**Returns** `Promise<Array<DefinitionEntry>>`

### .getTagEntries

Returns an array of [`DefinitionEntry`](#definitionentry) having the provided `tag`

**Arguments**

1. `tag: string`
1. `did?: string = this.id`

**Returns** `Promise<Array<DefinitionEntry>>`

### .contentIterator

Returns an async iterator of [`ContentEntry`](#contententry) for the given [`options`](#contentiteratoroptions)

**Arguments**

1. [`options?: ContentIteratorOptions`](#contentiteratoroptions)

**Returns** `AsyncIterableIterator<ContentEntry>`
