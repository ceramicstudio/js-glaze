---
title: Interfaces and types
---

## CeramicApi

Ceramic API interface exported by the [`@ceramicnetwork/common` library](https://docs.ceramic.network/modules/_ceramicnetwork_common.html)

## DID

`DID` instance exported by the [`dids` library](https://github.com/ceramicnetwork/js-did)

## DIDProvider

DID Provider interface exported by the [`dids` library](https://github.com/ceramicnetwork/js-did)

## Doctype

Doctype interface exported by the [`@ceramicnetwork/common` library](https://docs.ceramic.network/modules/_ceramicnetwork_common.html)

## JWSSignature

JWS Signature interface exported by the [`dids` library](https://github.com/ceramicnetwork/js-did)

## DocID

`DocID` instance exported by the [`@ceramicnetwork/docid` library](https://docs.ceramic.network/modules/_ceramicnetwork_docid.html)

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
  schema: string
  description: string
  url?: string
  family?: string
  config?: T
}
```

## DefinitionsAliases

```ts
type DefinitionsAliases = Record<string, string>
```

## ContentEntry

```ts
interface ContentEntry {
  key: IndexKey
  ref: string
  content: unknown
}
```

## IdentityIndexContent

Represents the shape of the content stored in the [Identity Index](idx-terminology.md#identity-index--idx)

```ts
type IdentityIndexContent = Record<IndexKey, string>
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

## DefinitionName

Name aliases of [Definitions](idx-terminology.md#definition) provided by the [IDX tools library](libs-tools.md)

```ts
type DefinitionName = 'basicProfile' | 'cryptoAccountLinks' | 'threeIdKeychain'
```

## SignedDefinitions

Signed [Definitions](idx-terminology.md#definition) provided by the [IDX tools library](libs-tools.md)

```ts
type SignedDefinitions = Record<DefinitionName, DagJWSResult>
```

## PublishedDefinitions

Record of [Definitions](idx-terminology.md#definition) published to [Ceramic](idx-terminology.md#ceramic)

```ts
type PublishedDefinitions = Record<DefinitionName, string>
```

## SchemaName

Names of [Schemas](idx-terminology.md#schema) provided by the [IDX tools library](libs-tools.md)

```ts
type SchemaName =
  | 'BasicProfile'
  | 'CryptoAccounts'
  | 'Definition'
  | 'IdentityIndex'
  | 'ThreeIdKeychain'
```

## SignedSchemas

Signed [Schemas](idx-terminology.md#schema) provided by the [IDX tools library](libs-tools.md)

```ts
type SignedSchemas = Record<SchemaName, DagJWSResult>
```

## PublishedSchemas

Record of [Schemas](idx-terminology.md#schema) published to [Ceramic](idx-terminology.md#ceramic)

```ts
type PublishedSchemas = Record<SchemaName, string>
```

## PublishedConfig

[Definitions](idx-terminology.md#definition) and [Schemas](idx-terminology.md#schema) published to [Ceramic](idx-terminology.md#ceramic)

```ts
interface PublishedConfig {
  definitions: PublishedDefinitions
  schemas: PublishedSchemas
}
```

## PublishDoc

```ts
interface PublishDoc<T = unknown> {
  id?: DocID | string
  content: T
  controllers?: Array<string>
  schema?: DocID | string
}
```

## DefinitionDoc

```ts
interface DefinitionDoc extends PublishDoc<Definition> {
  id: DocID | string
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
  aliases?: DefinitionsAliases
  autopin?: boolean
  ceramic: CeramicApi
}
```

## CreateOptions

Options used by the [`set` method](libs-idx.md#set) of the `IDX` class

```ts
interface CreateOptions {
  pin?: boolean
}
```
