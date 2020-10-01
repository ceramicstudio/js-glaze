---
title: Interfaces and types
---

## CeramicApi

Ceramic API interface exported by the [`@ceramicnetwork/ceramic-common` library](https://github.com/ceramicnetwork/js-ceramic/tree/develop/packages/ceramic-common)

## DID

`DID` instance exported by the [`dids` library](https://github.com/ceramicnetwork/js-did)

## DIDProvider

DID Provider interface exported by the [`dids` library](https://github.com/ceramicnetwork/js-did)

## Doctype

Doctype interface exported by the [`@ceramicnetwork/ceramic-common` library](https://github.com/ceramicnetwork/js-ceramic/tree/develop/packages/ceramic-common)

## JWSSignature

JWS Signature interface exported by the [`dids` library](https://github.com/ceramicnetwork/js-did)

## Resolver

`Resolver` instance exported by the [`did-resolver` library](https://github.com/decentralized-identity/did-resolver)

## ResolverOptions

`ResolverOptions` interface exported by the [`dids` library](https://github.com/ceramicnetwork/js-did)

## DocID

The [ID](idx-terminology.md#docid) of a [Ceramic Document](idx-terminology.md#document)

```ts
type DocID = string
```

## IndexKey

An opaque key used to identify references in the [Identity Index](#identityindexcontent)

```ts
type IndexKey = string
```

## Schema

A type representing a [JSON Schema](idx-terminology.md#schema)

```ts
type Schema = Record<string, unknown>
```

## Definition

A [Definition](idx-terminology.md#definition) is a [Ceramic Document](idx-terminology.md#document) describing a resource in the [Identity Index](idx-terminology.md#identity-index--idx)

```ts
interface Definition<T = unknown> {
  name: string
  schema: DocID
  description?: string
  url?: string
  config?: T
}
```

## DefinitionsAliases

```ts
type DefinitionsAliases = Record<string, IndexKey | DocID>
```

## ContentEntry

```ts
interface ContentEntry {
  key: IndexKey
  ref: DocID
  content: unknown
}
```

## IdentityIndexContent

Represents the shape of the content stored in the [Identity Index](idx-terminology.md#identity-index--idx)

```ts
type IdentityIndexContent = Record<IndexKey, DocID>
```

## EncodedDagJWS

```ts
interface EncodedDagJWS {
  payload: string
  signatures: Array<JWSSignature>
  link: string
}
```

## EncodedDagJWSResult

```ts
interface EncodedDagJWSResult {
  jws: EncodedDagJWS
  linkedBlock: string
}
```

## IDXDefinitionName

Name aliases of [Definitions](idx-terminology.md#definition) provided by the [IDX tools library](libs-tools.md)

```ts
type IDXDefinitionName = 'basicProfile' | 'cryptoAccountLinks'
```

## IDXSignedDefinitions

Signed [Definitions](idx-terminology.md#definition) provided by the [IDX tools library](libs-tools.md)

```ts
type IDXSignedDefinitions = Record<IDXDefinitionName, DagJWSResult>
```

## IDXPublishedDefinitions

Record of [Definitions](idx-terminology.md#definition) published to [Ceramic](idx-terminology.md#ceramic)

```ts
type IDXPublishedDefinitions = Record<IDXDefinitionName, DocID>
```

## IDXSchemaName

Names of [Schemas](idx-terminology.md#schema) provided by the [IDX tools library](libs-tools.md)

```ts
type IDXSchemaName = 'BasicProfile' | 'CryptoAccountLinks' | 'Definition' | 'IdentityIndex'
```

## IDXSignedSchemas

Signed [Schemas](idx-terminology.md#schema) provided by the [IDX tools library](libs-tools.md)

```ts
type IDXSignedSchemas = Record<IDXSchemaName, DagJWSResult>
```

## IDXPublishedSchemas

Record of [Schemas](idx-terminology.md#schema) published to [Ceramic](idx-terminology.md#ceramic)

```ts
type IDXPublishedSchemas = Record<IDXSchemaName, DocID>
```

## IDXPublishedConfig

[Definitions](idx-terminology.md#definition) and [Schemas](idx-terminology.md#schema) published to [Ceramic](idx-terminology.md#ceramic)

```ts
interface IDXPublishedConfig {
  definitions: IDXPublishedDefinitions
  schemas: IDXPublishedSchemas
}
```

## PublishDoc

```ts
interface PublishDoc<T = unknown> {
  id?: DocID
  content: T
  owners?: Array<string>
  schema?: DocID
}
```

## DefinitionDoc

```ts
interface DefinitionDoc extends PublishDoc<Definition> {
  id: DocID
}
```

## SchemaDoc

```ts
interface SchemaDoc extends PublishDoc<Schema> {
  name: string
}
```

## IDXOptions

Options used by the [IDX class constructor](libs-idx.md#constructor)

```ts
interface IDXOptions {
  autopin?: boolean
  ceramic: CeramicApi
  definitions?: DefinitionsAliases
  resolver?: ResolverOptions
}
```

### AuthenticateOptions

Options used by the [`authenticate` method](libs-idx.md#authenticate) of the `IDX` class

```ts
interface AuthenticateOptions {
  paths?: Array<string>
  provider?: DIDProvider
}
```

### CreateOptions

Options used by the [`set` method](libs-idx.md#set) of the `IDX` class

```ts
interface CreateOptions {
  pin?: boolean
}
```
