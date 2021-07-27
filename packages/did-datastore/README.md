# DID DataStore

Associate data records to a DID

## Installation

```sh
npm install @glazed/did-datastore
```

## Types

### DefinitionContentType

```ts
type DefinitionContentType<
  ModelTypes extends ModelTypeAliases,
  Alias extends keyof ModelTypes['definitions']
> = ModelTypes['schemas'][ModelTypes['definitions'][Alias]]
```

### DefinitionsContentTypes

```ts
type DefinitionsContentTypes<
  ModelTypes extends ModelTypeAliases,
  Fallback = Record<string, unknown>
> = {
  [Key: string]: typeof Key extends keyof ModelTypes['definitions']
    ? DefinitionContentType<ModelTypes, typeof Key>
    : Fallback
}
```

### DefinitionWithID

```ts
type DefinitionWithID<Config extends Record<string, unknown> = Record<string, unknown>> =
  Definition<Config> & { id: StreamID }
```

### Entry

```ts
type Entry = {
  key: string
  id: string
  record: unknown
}
```

### CreateOptions

```ts
type CreateOptions = {
  pin?: boolean
}
```

### DIDDataStoreParams

```ts
type DIDDataStoreParams<ModelTypes extends ModelTypeAliases = ModelTypeAliases> = {
  autopin?: boolean
  ceramic: CeramicApi
  model: DataModel<ModelTypes> | ModelTypesToAliases<ModelTypes>
}
```

## DIDDataStore class

### Types

- `ModelTypes extends ModelTypeAliases = ModelTypeAliases`
- `Alias extends keyof ModelTypes['definitions'] = keyof ModelTypes['definitions']`

### constructor

**Arguments**

1. [`params: DIDDataStoreParams<ModelTypes>`](#diddatastoreparams)

### .authenticated

**Returns:** `boolean`

### .ceramic

**Returns:** `CeramicApi` instance

### .id

**Returns:** `string`

### .model

**Returns:** `DataModel<ModelTypes>` instance

### .has()

**Arguments**

1. `key: Alias`
1. `did?: string`

**Returns:** `Promise<boolean>`

### .get()

**Types**

- `Key extends Alias`
- `ContentType = DefinitionContentType<ModelTypes, Key>`

**Arguments**

1. `key: Key`
1. `did?: string`

**Returns:** `Promise<ContentType | null>`

### .set()

**Types**

- `Key extends Alias`
- `ContentType = DefinitionContentType<ModelTypes, Key>`

**Arguments**

1. `key: Key`
1. `content: ContentType`
1. `options?: CreateOptions`

**Returns:** `Promise<StreamID>`

### .merge()

**Types**

- `Key extends Alias`
- `ContentType = DefinitionContentType<ModelTypes, Key>`

**Arguments**

1. `key: Key`
1. `content: ContentType`
1. `options?: CreateOptions`

**Returns:** `Promise<StreamID>`

### .setAll()

**Types**

- `Contents extends DefinitionsContentTypes<ModelTypes>`

**Arguments**

1. `contents: Contents`
1. `options?: CreateOptions`

**Returns:** `Promise<IdentityIndex>`

### .setDefaults()

**Types**

- `Contents extends DefinitionsContentTypes<ModelTypes>`

**Arguments**

1. `contents: Contents`
1. `options?: CreateOptions`

**Returns:** `Promise<IdentityIndex>`

### .getIndex()

**Arguments**

1. `did?: string`

**Returns:** `Promise<IdentityIndex | null>`

### .iterator()

**Arguments**

1. `did?: string`

**Returns:** `AsyncIterableIterator<Entry>`

### .getDefinitionID()

**Arguments**

1. `aliasOrID: string`

**Returns:** `string`

### .getDefinition()

**Arguments**

1. `id: StreamID | string`

**Returns:** `Promise<DefinitionWithID>`

### .getRecordID()

**Arguments**

1. `definitionID: string`
1. `did?: string`

**Returns:** `Promise<string | null>`

### .getRecordDocument()

**Arguments**

1. `definitionID: string`
1. `did?: string`

**Returns:** `Promise<TileDocument | null>`

### .getRecord()

**Types**

- `ContentType = unknown`

**Arguments**

1. `definitionID: string`
1. `did?: string`

**Returns:** `Promise<ContentType | null>`

### .setRecord()

**Arguments**

1. `definitionID: string`
1. `content: Record<string, any>`
1. `options?: CreateOptions`

**Returns:** `Promise<StreamID>`

## Maintainers

- Paul Le Cam ([@paullecam](http://github.com/paullecam))

## License

Dual licensed under MIT and Apache 2
