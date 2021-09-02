# Glaze DataModel

Aliases for Ceramic stream references

## [Documentation](https://developers.ceramic.network/tools/glaze/datamodel/)

## Installation

```sh
npm install @glazed/datamodel
```

## Example

```ts
import { CeramicClient } from '@ceramicnetwork/http-client'
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

const ceramic = new CeramicClient()
const model = new DataModel({ ceramic, model: modelAliases })

// The model exposes simple APIs over the provided model aliases
const blogPostSchemaURL = model.getSchemaURL('BlogPost')

// Individual tiles defined in the model aliases can be loaded using the alias
const examplePost = await model.loadTile('examplePost')

// New tiles can be created using the defined schema aliases
const newPost = await model.createTile('BlogPost', { title: 'new post', text: 'Hello world' })
```

## Maintainers

- Paul Le Cam ([@paullecam](http://github.com/paullecam))

## License

Dual licensed under MIT and Apache 2
