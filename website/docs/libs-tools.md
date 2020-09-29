---
title: IDX Tools library
---

## Constants

### schemas

A record of the [`Schemas`](libs-types.md#schema), keyed by [IDX schema name](libs-types.md#idxschemaname):

- `BasicProfile`: see [Basic Profile CIP](https://github.com/ceramicnetwork/CIP/issues/32)
- `CryptoAccountLinks`: see [Crypto Account Links CIP](https://github.com/ceramicnetwork/CIP/issues/44)
- `Definition` (CIP to be defined)
- `DocIdDocIdMap`: see [DocId to DocId Map CIP](https://github.com/ceramicnetwork/CIP/issues/54)
- `DocIdMap`: see [DocId Map CIP](https://github.com/ceramicnetwork/CIP/issues/51)
- `IdentityIndex` see [Identity Index CIP](https://github.com/ceramicnetwork/CIP/issues/3)
- `StringMap`: see [String Map CIP](https://github.com/ceramicnetwork/CIP/issues/50)

**Returns** `Record<IDXSchemaName, Schema>`

### signedDefinitions

A record of signed [`Definitions`](idx-terminology.md#definition), keyed by [IDX definition name](libs-types.md#idxdefinitionname):

**Returns** `Record<IDXDefinitionName, DagJWSResult>`

### signedSchemas

A record of the signed [`schemas`](#schemas)

**Returns** `Record<IDXDefinitionName, DagJWSResult>`

## API

### validateSchema

Checks if a [JSON Schema](#libs-types.md#schema) is valid and secure according to [Ajv's secure schema](https://github.com/ajv-validator/ajv#security-risks-of-trusted-schemas)

**Arguments**

1. [`schema: Schema`](#libs-types.md#schema)

**Returns** `boolean`

### publishDoc

Creates or updates a document defined by the [`PublishDoc`](#libs-types.md#publishdoc) interface

**Type parameters**

1. `T = unknown`

***Arguments**

1. [`ceramic: CeramicApi`](#libs-types.md#ceramicapi)
1. [`doc: PublishDoc<T>`](#libs-types.md#publishdoc)

**Returns** [`Promise<DocID>`](#libs-types.md#docid)

### publishDefinition

Similar to [`publishDoc`](#publishdoc) for a [`DefinitionDoc`](#libs-types.md#definitiondoc)

***Arguments**

1. [`ceramic: CeramicApi`](#libs-types.md#ceramicapi)
1. [`doc: DefinitionDoc`](#libs-types.md#definitiondoc)

**Returns** [`Promise<DocID>`](#libs-types.md#docid)

### publishSchema

Similar to [`publishDoc`](#publishdoc) for a [`SchemaDoc`](#libs-types.md#schemadoc), with additional validation using [`validateSchema`](#validateschema)

***Arguments**

1. [`ceramic: CeramicApi`](#libs-types.md#ceramicapi)
1. [`doc: SchemaDoc`](#libs-types.md#schemadoc)

**Returns** [`Promise<DocID>`](#libs-types.md#docid)

### publishIDXConfig

Publishes the signed [Definitions](idx-terminology.md#definition) and [Schemas](#schemas) provided by IDX

***Arguments**

1. [`ceramic: CeramicApi`](#libs-types.md#ceramicapi)

**Returns** [`Promise<IDXPublishedConfig>`](#libs-types.md#idxpublishedconfig)
