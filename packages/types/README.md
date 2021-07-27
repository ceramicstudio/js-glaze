# Glaze types

Shared types for Glaze packages

## Installation

```sh
npm install --dev @glazed/types
```

## Types

### EncodedDagJWS

Uses [`JWSSignature` from the `dids` package](https://ceramicnetwork.github.io/js-did/modules.html#jwssignature)

```ts
type EncodedDagJWS = {
  payload: string
  signatures: Array<JWSSignature>
  link?: string
}
```

### EncodedDagJWS

```ts
type EncodedDagJWSResult = {
  jws: EncodedDagJWS
  linkedBlock: string // base64
}
```

### Schema

Uses [`JSONSchemaType` from the `ajv` package](https://ajv.js.org/guide/typescript.html)

```ts
type Schema<T = Record<string, any>> = JSONSchemaType<T> & {
  $comment?: string
  title?: string
}
```

### ModelData

```ts
type ModelData<T> = {
  definitions: Record<string, T>
  schemas: Record<string, T>
  tiles: Record<string, T>
}
```

### MapModelTypes

```ts
type MapModelTypes<Model extends ModelData<any>, ToType> = {
  schemas: Record<keyof Model['schemas'], ToType>
  definitions: Record<keyof Model['definitions'], ToType>
  tiles: Record<keyof Model['tiles'], ToType>
}
```

### CastModelTo

```ts
type CastModelTo<Model extends ModelData<any> | void, ToType> = Model extends ModelData<any>
  ? MapModelTypes<Model, ToType>
  : ModelData<ToType>
```

### PublishedModel

```ts
type PublishedModel<Model extends ModelData<any> | void = void> = CastModelTo<Model, string>
```

### ModelTypeAliases

```ts
type ModelTypeAliases<
  // Schema alias to content type
  Schemas extends Record<string, any> = Record<string, any>,
  // Definition alias to schema alias
  Definitions extends Record<string, keyof Schemas> = Record<string, string>,
  // Tile alias to schema alias
  Tiles extends Record<string, keyof Schemas> = Record<string, string>
> = {
  schemas: Schemas
  definitions: Definitions
  tiles: Tiles
}
```

### ModelTypesToAliases

```ts
type ModelTypesToAliases<TypeAliases extends ModelTypeAliases> = MapModelTypes<TypeAliases, string>
```

### ManagedID

```ts
type ManagedID = string // StreamID
```

### ManagedDoc

Uses [`DagJWSResult` from the `dids` package](https://ceramicnetwork.github.io/js-did/interfaces/dagjwsresult.html)

```ts
type ManagedDoc<CommitType = DagJWSResult> = {
  alias: string
  commits: Array<CommitType>
  version: string // CommitID
}
```

### ManagedEntry

Uses [`DagJWSResult` from the `dids` package](https://ceramicnetwork.github.io/js-did/interfaces/dagjwsresult.html)

```ts
type ManagedEntry<CommitType = DagJWSResult> = ManagedDoc<CommitType> & {
  schema: ManagedID
}
```

### ManagedSchema

Uses [`DagJWSResult` from the `dids` package](https://ceramicnetwork.github.io/js-did/interfaces/dagjwsresult.html)

```ts
type ManagedSchema<CommitType = DagJWSResult> = ManagedDoc<CommitType> & {
  dependencies: Record<string, Array<ManagedID>> // path to schemas ManagedID
}
```

### ManagedModel

Uses [`DagJWSResult` from the `dids` package](https://ceramicnetwork.github.io/js-did/interfaces/dagjwsresult.html)

```ts
type ManagedModel<CommitType = DagJWSResult> = {
  schemas: Record<ManagedID, ManagedSchema<CommitType>>
  definitions: Record<ManagedID, ManagedEntry<CommitType>>
  tiles: Record<ManagedID, ManagedEntry<CommitType>>
}
```

### EncodedManagedModel

Uses [`DagJWSResult` from the `dids` package](https://ceramicnetwork.github.io/js-did/interfaces/dagjwsresult.html)

```ts
type EncodedManagedModel = ManagedModel<EncodedDagJWSResult>
```

## License

Dual licensed under MIT and Apache 2
