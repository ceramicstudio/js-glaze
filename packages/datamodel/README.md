# Glaze DataModel

## Installation

```sh
npm install @glazed/datamodel
```

## Example

```ts
import Ceramic from '@ceramicnetwork/http-client'
import { DataModel } from '@glazed/datamodel'

// The model aliases associate human-readable names to Ceramic stream IDs or URLs
const modelAliases = {
  schemas: {
    BlogPost: 'ceramic://<schema URL>',
  },
  definitions: {},
  tiles: {
    examplePost: '<stream ID>',
  },
}

const ceramic = new Ceramic()
const model = new DataModel({ ceramic, model: modelAliases })

// The model exposes simple APIs over the provided model aliases
const blogPostSchemaURL = model.getSchemaURL('BlogPost')

// Individual tiles defined in the model aliases can be loaded using the alias
const examplePost = await model.loadTile('examplePost')

// New tiles can be created using the defined schema aliases
const newPost = await model.createTile('BlogPost', { title: 'new post', text: 'Hello world' })
```

## Types

### CreateOptions

```ts
type CreateOptions = {
  pin?: boolean
}
```

### DataModelParams

```ts
type DataModelParams<Model> = {
  autopin?: boolean
  ceramic: CeramicApi
  model: Model
}
```

## DataModel class

### Types

- `ModelTypes extends ModelTypeAliases`
- `ModelAliases extends ModelTypesToAliases<ModelTypes> = ModelTypesToAliases<ModelTypes>`

### constructor

**Arguments**

1. [`params: DataModelParams<ModelAliases>`](#datamodelparams)

### .ceramic

**Returns:** `CeramicApi` instance

### .getDefinitionID()

**Types**

- `Alias extends keyof ModelAliases['definitions']`

**Arguments**

1. `alias: Alias`

**Returns:** `string | null`

### .getSchemaURL()

**Types**

- `Alias extends keyof ModelAliases['schemas']`

**Arguments**

1. `alias: Alias`

**Returns:** `string | null`

### .getTileID()

**Types**

- `Alias extends keyof ModelAliases['tiles']`

**Arguments**

1. `alias: Alias`

**Returns:** `string | null`

### .loadTile()

**Types**

- `Alias extends keyof ModelAliases['tiles']`
- `ContentType = ModelTypes['schemas'][ModelTypes['tiles'][Alias]]`

**Arguments**

1. `alias: Alias`

**Returns:** `Promise<TileDocument<ContentType> | null>`

### .createTile()

**Types**

- `Alias extends keyof ModelAliases['schemas']`
- `ContentType = ModelTypes['schemas'][Alias]`

**Arguments**

1. `schemaAlias: Alias`
1. `content: ContentType`
1. `options?: CreateOptions = {}`

**Returns:** `Promise<TileDocument<ContentType> | null>`

## Maintainers

- Paul Le Cam ([@paullecam](http://github.com/paullecam))

## License

Dual licensed under MIT and Apache 2
