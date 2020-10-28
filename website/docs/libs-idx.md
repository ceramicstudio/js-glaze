---
title: IDX library
---

## Installation

```sh
npm install @ceramicstudio/idx
```

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

Returns whether an entry with the `name` alias, [`IndexKey`](libs-types.md#indexkey) or definition [`DocID string`](libs-types.md#docid) exists in the [Identity Index](idx-terminology.md#identity-index--idx) of the specified `did`

**Arguments**

1. `name: string`
1. `did?: string = this.id`

**Returns** `Promise<boolean>`

### .get

Returns the referenced content for the given `name` alias, [`IndexKey`](libs-types.md#indexkey) or definition [`DocID string`](libs-types.md#docid) of the specified `did`

**Arguments**

1. `name: string`
1. `did?: string = this.id`

**Returns** `Promise<unknown>`

### .set

Sets the content for the given `name` alias, [`IndexKey`](libs-types.md#indexkey) or definition [`DocID string`](libs-types.md#docid) in the [Identity Index](idx-terminology.md#identity-index--idx) of the authenticated [DID](idx-terminology.md#did)

> The provided options are only applied if the document is being created, if it already exists they are ignored

**Arguments**

1. `name: string`
1. `content: unknown`
1. `options?: CreateOptions`

**Returns** `Promise<DocID>` the [`DocID`](libs-types.md#docid) of the created content document

### .merge

Performs a shallow (only one level) merge the contents for the given `name` alias, [`IndexKey`](libs-types.md#indexkey) or definition [`DocID string`](libs-types.md#docid) in the [Identity Index](idx-terminology.md#identity-index--idx) of the authenticated [DID](idx-terminology.md#did)

> The provided options are only applied if the document is being created, if it already exists they are ignored

**Arguments**

1. `name: string`
1. `content: unknown`
1. `options?: CreateOptions`

**Returns** `Promise<DocID>` the [`DocID`](libs-types.md#docid) of the created content document

### .setAll

Similar to the [`set` method](#set) but for setting multiple keys at once in a more efficient way.

The [Identity Index](idx-terminology.md#identity-index--idx) document will only get updated if all the contents are successfully set.

**Arguments**

1. `contents: Record<string, unknown>`
1. `options?: CreateOptions`

### .setDefaults

Similar to the [`setAll` method](#setall) but only sets contents for keys that are not already present in the [Identity Index](idx-terminology.md#identity-index--idx) document.

**Arguments**

1. `contents: Record<string, unknown>`
1. `options?: CreateOptions`

### .remove

Removes the definition for the `name` alias, [`IndexKey`](libs-types.md#indexkey) or definition [`DocID string`](libs-types.md#docid) in the [Identity Index](idx-terminology.md#identity-index--idx) of the authenticated [DID](idx-terminology.md#did)

**Arguments**

1. `name: string`

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

### .contentIterator

Returns an async iterator of [`ContentEntry`](libs-types.md#contententry) for the given `did`

**Arguments**

1. `did?: string = this.id`

**Returns** `AsyncIterableIterator<ContentEntry>`

### .getDefinition

Loads an existing [Definition](libs-types.md#definition) by its [`DocID string`](libs-types.md#docid) or [`IndexKey`](libs-types.md#indexkey)

**Arguments**

1. `id: string`

**Returns** `Promise<Definition>`
