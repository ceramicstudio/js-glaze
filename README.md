![IDX header image](https://camo.githubusercontent.com/05a4ba66c346c7d52bc46ce8526c6a7d3f227880/68747470733a2f2f75706c6f6164732d73736c2e776562666c6f772e636f6d2f3565626362656633616334393534313936646364633762352f3566316565353133316335343165316364623837633132315f69646b7468696e322e6a7067)

# js-idx

[![](https://img.shields.io/badge/Chat%20on-Discord-orange.svg?style=flat)](https://discord.gg/XpBAQtX)

> This project is WIP. Read and contribute to the spec [here](https://www.notion.so/threebox/IDP2P-IDW-2-0-e713338a094a44758ce2c3f21cdce27e).

**js-idx** is a JavaScript library for managing decentralized identities. It provides high-level APIs for interacting with various decentralized identity standards implemented on the Ceramic network such as 3ID DIDs, IDX, profiles, and more.

## Installation

```sh
npm install @ceramicstudio/idx
```

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

The ID of a Ceramic document.

```ts
type DocID = string
```

### Definition

```ts
interface Definition<T extends Record<string, unknown> = Record<string, unknown>> {
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

```ts
interface Entry {
  tags: Array<string>
  referenceId: DocID
}
```

### RootIndexContent

```ts
type RootIndexContent = Record<DocID, Entry>
```

### SchemaType

```ts
type SchemaType = 'BasicProfile' | 'Definition' | 'DocIdDocIdMap' | 'DocIdMap' | 'StringMap'
```

### SchemasAliases

```ts
type SchemasAliases = Record<SchemaType, DocID>
```

### AuthenticateOptions

```ts
interface AuthenticateOptions {
  paths?: Array<string>
  provider?: DIDProvider
}
```

### IDXOptions

```ts
interface IDXOptions {
  ceramic: CeramicApi
  definitions?: DefinitionsAliases
  resolver?: ResolverOptions
  schemas: SchemasAliases
}
```

## API

### IDX class

#### constructor

**Arguments**

1. `options: IDXOptions`

### .authenticate

**Arguments**

1. `options?: AuthenticateOptions`

**Returns** `Promise<void>`

#### .authenticated

**Returns** `boolean`

#### .ceramic

**Returns** `CeramicApi`

#### .resolver

**Returns** `Resolver`

#### .did

> Accessing this property will throw an error if the instance is not authenticated

**Returns** `DID`

#### .id

> Accessing this property will throw an error if the instance is not authenticated

**Returns** `string`

#### .has

Returns whether an entry with the `name` alias exists in the Root Index of the specified `did`

**Arguments**

1. `name: string`
1. `did?: string = this.id`

**Returns** `Promise<boolean>`

#### .get

Returns the referenced content for the given `name` alias of the specified `did`

**Arguments**

1. `name: string`
1. `did?: string = this.id`

**Returns** `Promise<unknown>`

#### .set

Sets the content for the given `name` alias in the Root Index of the authenticated DID

**Arguments**

1. `name: string`
1. `content: unknown`

**Returns** `Promise<DocID>` the `DocID` of the created content document

#### .remove

Removes the definition for the `name` alias in the Root Index of the authenticated DID

**Arguments**

1. `name: string`

**Returns** `Promise<void>`

#### .getRootId

**Arguments**

1. `did: string`

**Returns** `Promise<DocID | null>`

#### .getRoot

**Arguments**

1. `did?: string = this.id`

**Returns** `Promise<RootIndexContent | null>`

#### .createDefinition

**Arguments**

1. `definition: Definition`

**Returns** `Promise<DocID>`

#### .getDefinition

**Arguments**

1. `id: DocID`

**Returns** `Promise<Definition>`

#### .getEntry

**Arguments**

1. `definitionId: DocID`
1. `did?: string = this.id`

**Returns** `Promise<Entry | null>`

#### .getEntryReference

**Arguments**

1. `definitionId: DocID`
1. `did?: string = this.id`

**Returns** `Promise<unknown | null>`

#### .getEntryTags

**Arguments**

1. `definitionId: DocID`
1. `did?: string = this.id`

**Returns** `Promise<Array<string>>`

#### .setEntry

**Arguments**

1. `definitionId: DocID`
1. `entry: Entry`

**Returns** `Promise<void>`

#### .setEntryReference

Sets the content of the entry reference.

> The provided tags will only be set if the entry is getting created, if it already exists tags will not be changed

**Arguments**

1. `definitionId: DocID`
1. `content: unknown`
1. `tags?: Array<string> = []`

**Returns** `Promise<DocID>` the `DocID` of the created content document

#### .addEntryTag

**Arguments**

1. `definitionid: DocID`
1. `tag: string`

**Returns** `Promise<Array<string>>` the updated set of tags

#### .removeEntryTag

**Arguments**

1. `definitionId: DocID`
1. `tag: string`

**Returns** `Promise<Array<string>>` the updated set of tags

#### .addEntry

**Arguments**

1. `definition: Definition`
1. `content: unknown`
1. `tags?: Array<string> = []`

**Returns** `Promise<DocID>` the `DocID` of the created definition document

#### .removeEntry

**Arguments**

1. `definitionId: DocID`

**Returns** `Promise<void>`

## License

MIT
