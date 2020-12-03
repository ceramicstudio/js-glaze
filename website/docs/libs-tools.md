---
title: IDX Tools library
---

## Installation

```sh
npm install @ceramicstudio/idx-tools
```

## Constants

### schemas

A record of the [`Schemas`](libs-types.md#schema), keyed by [IDX schema name](libs-types.md#idxschemaname):

- `BasicProfile`: see [Basic Profile CIP](https://github.com/ceramicnetwork/CIP/issues/32)
- `CryptoAccounts`: see [Crypto Accounts CIP](https://github.com/ceramicnetwork/CIP/issues/44)
- `Definition` (CIP to be defined)
- `IdentityIndex` see [Identity Index CIP](https://github.com/ceramicnetwork/CIP/issues/3)
- `ThreeIdKeychain`

**Returns** `Record<IDXSchemaName, Schema>`

### signedDefinitions

A record of signed [`Definitions`](idx-terminology.md#definition), keyed by [IDX definition name](libs-types.md#idxdefinitionname):

**Returns** `Record<IDXDefinitionName, DagJWSResult>`

### signedSchemas

A record of the signed [`schemas`](#schemas)

**Returns** `Record<IDXSchemaName, DagJWSResult>`

## API

### isSecureSchema

Checks if a [JSON Schema](libs-types.md#schema) is valid and secure according to [Ajv's secure schema](https://github.com/ajv-validator/ajv#security-risks-of-trusted-schemas)

**Arguments**

1. [`schema: Schema`](libs-types.md#schema)

**Returns** `boolean`

### publishDoc

Creates or updates a document defined by the [`PublishDoc`](libs-types.md#publishdoc) interface

**Type parameters**

1. `T = unknown`

**Arguments**

1. [`ceramic: CeramicApi`](libs-types.md#ceramicapi)
1. [`doc: PublishDoc<T>`](libs-types.md#publishdoc)

**Returns** [`Promise<DocID>`](libs-types.md#docid)

### createDefinition

Creates and publishes a new [`Definition`](idx-terminology.md#definition)

**Arguments**

1. [`ceramic: CeramicApi`](libs-types.md#ceramicapi)
1. [`definition: Definition`](libs-types.md#definition)

**Returns** [`Promise<DocID>`](libs-types.md#docid)

### updateDefinition

Similar to [`publishDoc`](#publishdoc) for an existing [`DefinitionDoc`](libs-types.md#definitiondoc)

**Arguments**

1. [`ceramic: CeramicApi`](libs-types.md#ceramicapi)
1. [`doc: DefinitionDoc`](libs-types.md#definitiondoc)

**Returns** `Promise<boolean>` whether the definition contents have changed

### publishSchema

Similar to [`publishDoc`](#publishdoc) for a [`SchemaDoc`](libs-types.md#schemadoc), with additional validation using [`validateSchema`](#validateschema)

**Arguments**

1. [`ceramic: CeramicApi`](libs-types.md#ceramicapi)
1. [`doc: SchemaDoc`](libs-types.md#schemadoc)

**Returns** [`Promise<DocID>`](libs-types.md#docid)

### publishIDXConfig

Publishes the signed [Definitions](idx-terminology.md#definition) and [Schemas](#schemas) provided by IDX

**Arguments**

1. [`ceramic: CeramicApi`](libs-types.md#ceramicapi)

**Returns** [`Promise<IDXPublishedConfig>`](libs-types.md#idxpublishedconfig)
