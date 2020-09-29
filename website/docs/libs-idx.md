---
title: IDX library APIs
---

## IDX class

### constructor

**Arguments**

1. [`options: IDXOptions`](libs-types.md#idxoptions)

### .authenticate

**Arguments**

1. [`options?: AuthenticateOptions`](libs-types.md#authenticateoptions)

**Returns** `Promise<void>`

### .authenticated

**Returns** `boolean`

### .ceramic

**Returns** [`CeramicApi`](libs-types.md#ceramicapi)

### .resolver

**Returns** [`Resolver`](libs-types.md#resolver)

### .did

> Accessing this property will throw an error if the instance is not authenticated

**Returns** [`DID`](libs-types.md#did)

### .id

> Accessing this property will throw an error if the instance is not authenticated

**Returns** `string`

### .isSupported

Checks if the provided `did` supports IDX. Calling methods such as [get](#get) using a DID without IDX support will result in these methods returning `null` or other fallbacks.

If the `did` argument is not provided, the check will be performed on the DID authenticated with the IDX instance. Calling mutation methods such as [set](#set) using a DID without IDX support will throw errors.

**Arguments**

1. `did?: string`

**Returns** `Promise<boolean>`

### .has

Returns whether an entry with the `name` alias or definition [`DocID`](libs-types.md#docid) exists in the [Identity Index](idx-terminology.md#identity-index--idx) of the specified `did`

**Arguments**

1. `name: string | DocID`
1. `did?: string = this.id`

**Returns** `Promise<boolean>`

### .get

Returns the referenced content for the given `name` alias or definition [`DocID`](libs-types.md#docid) of the specified `did`

**Arguments**

1. `name: string | DocID`
1. `did?: string = this.id`

**Returns** `Promise<unknown>`

### .set

Sets the content for the given `name` alias or definition [`DocID`](libs-types.md#docid) in the [Identity Index](idx-terminology.md#identity-index--idx) of the authenticated [DID](idx-terminology.md#did)

**Arguments**

1. `name: string | DocID`
1. `content: unknown`

**Returns** `Promise<DocID>` the [`DocID`](libs-types.md#docid) of the created content document

### .addTag

Adds a tag for the given `name` alias or definition [`DocID`](libs-types.md#docid) in the [Identity Index](idx-terminology.md#identity-index--idx) of the authenticated [DID](idx-terminology.md#did)

**Arguments**

1. `name: string | DocID`
1. `tag: string`

**Returns** `Promise<Array<string>>` the updated set of tags

### .removeTag

Removes a tag for the given `name` alias or definition [`DocID`](libs-types.md#docid) in the [Identity Index](idx-terminology.md#identity-index--idx) of the authenticated [DID](idx-terminology.md#did)

**Arguments**

1. `name: string | DocID`
1. `tag: string`

**Returns** `Promise<Array<string>>` the updated set of tags

### .remove

Removes the definition for the `name` alias or definition [`DocID`](libs-types.md#docid) in the [Identity Index](idx-terminology.md#identity-index--idx) of the authenticated [DID](idx-terminology.md#did)

**Arguments**

1. `name: string | DocID`

**Returns** `Promise<void>`

### .getIDXDocID

Returns the [`DocID`](libs-types.md#docid) of the [Identity Index](idx-terminology.md#identity-index--idx) associated to the given `did`

**Arguments**

1. `did: string`

**Returns** `Promise<DocID | null>`

### .getIDXContent

Returns the [contents](libs-types.md#identityindexcontent) of the [Identity Index](idx-terminology.md#identity-index--idx) associated to the given `did`

**Arguments**

1. `did?: string = this.id`

**Returns** `Promise<IdentityIndexContent | null>`

### .createDocument

Creates a new Document in the Ceramic network. This document will **not** be attached to the [Identity Index](idx-terminology.md#identity-index--idx), [`setEntryContent`](#setentrycontent) should be used for this purpose.

**Arguments**

1. `content: unknown`
1. `meta?: Partial<DocMetadata>`
1. `options?: CreateOptions`

**Returns** `Promise<Doctype>`

### .loadDocument

Loads a Document from the Ceramic network

**Arguments**

1. `id: DocID`

**Returns** `Promise<Doctype>`

### .getDefinition

Loads an existing [Definition](libs-types.md#definition) by its [`DocID`](libs-types.md#docid)

**Arguments**

1. `id: DocID`

**Returns** `Promise<Definition>`

### .getEntryContent

Returns the contents of the [Entry](libs-types.md#entry) for the given [Definition](libs-types.md#definition) [`DocID`](libs-types.md##docid) if present in the [Identity Index](idx-terminology.md#identity-index--idx) of the given `did`

**Arguments**

1. `definitionId: DocID`
1. `did?: string = this.id`

**Returns** `Promise<unknown | null>`

### .getEntryTags

Returns set of tags of the [Entry](libs-types.md#entry) for the given [Definition](libs-types.md#definition) [`DocID`](libs-types.md#docid) if present in the [Identity Index](idx-terminology.md#identity-index--idx) of the given `did`

**Arguments**

1. `definitionId: DocID`
1. `did?: string = this.id`

**Returns** `Promise<Array<string>>`

### .setEntryContent

Sets the content of the entry reference.

> The provided options are only applied if the entry is being created, if it already exists they are ignored

**Arguments**

1. `definitionId: DocID`
1. `content: unknown`
1. `options?: CreateContentOptions`

**Returns** `Promise<DocID>` the [`DocID`](libs-types.md#docid) of the created content document

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

Returns an array of [`DefinitionEntry`](libs-types.md#definitionentry) having the provided `tag`

**Arguments**

1. `tag: string`
1. `did?: string = this.id`

**Returns** `Promise<Array<DefinitionEntry>>`

### .contentIterator

Returns an async iterator of [`ContentEntry`](libs-types.md#contententry) for the given [`options`](libs-types.md#contentiteratoroptions)

**Arguments**

1. [`options?: ContentIteratorOptions`](libs-types.md#contentiteratoroptions)

**Returns** `AsyncIterableIterator<ContentEntry>`
