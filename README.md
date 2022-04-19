# Glaze monorepo

Packages providing the JavaScript/TypeScript implementation of the [Glaze ecosystem](https://developers.ceramic.network/tools/glaze/overview/).

## Installation

This monorepo uses Yarn workspaces, make sure to install it first if you don't already have it.

1. `yarn install` to install the dependencies
1. `yarn build` to build all the packages

### Additional scripts

- `yarn lint` to run the linter in all packages
- `yarn test` to run tests in all packages
- `yarn docs` to generate API documentation

## Packages

| Name                                                              | Description                                                                                               | Version                                                                      |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Runtime libraries**                                             |
| [`@glazed/tile-loader`](./packages/tile-loader)                   | [Batching and caching for Ceramic streams](https://developers.ceramic.network/tools/glaze/tile-loader/)   | ![npm version](https://img.shields.io/npm/v/@glazed/tile-loader.svg)         |
| [`@glazed/datamodel`](./packages/datamodel)                       | [Aliases for Ceramic stream references](https://developers.ceramic.network/tools/glaze/datamodel/)        | ![npm version](https://img.shields.io/npm/v/@glazed/datamodel.svg)           |
| [`@glazed/did-datastore`](./packages/did-datastore)               | [Associate data records to a DID](https://developers.ceramic.network/tools/glaze/did-datastore/)          | ![npm version](https://img.shields.io/npm/v/@glazed/did-datastore.svg)       |
| **Developer tools**                                               |
| [`@glazed/devtools`](./packages/devtools)                         | [Development tools library](https://developers.ceramic.network/tools/glaze/development/#devtools-library) | ![npm version](https://img.shields.io/npm/v/@glazed/devtools.svg)            |
| [`@glazed/cli`](./packages/cli)                                   | [CLI](https://developers.ceramic.network/tools/glaze/development/#cli)                                    | ![npm version](https://img.shields.io/npm/v/@glazed/cli.svg)                 |
| **Internal libraries**                                            |
| [`@glazed/constants`](./packages/constants)                       | Shared constants                                                                                          | ![npm version](https://img.shields.io/npm/v/@glazed/constants.svg)           |
| [`@glazed/did-datastore-model`](./packages/did-datastore-model)   | DataModel for the DID DataStore                                                                           | ![npm version](https://img.shields.io/npm/v/@glazed/did-datastore-model.svg) |
| [`@glazed/types`](./packages/types)                               | Shared types                                                                                              | ![npm version](https://img.shields.io/npm/v/@glazed/types.svg)               |
| **Jest environments**                                             |
| [`jest-environment-ceramic`](./packages/jest-environment-ceramic) | Ceramic environment for Jest tests                                                                        | ![npm version](https://img.shields.io/npm/v/jest-environment-ceramic.svg)    |
| [`jest-environment-glaze`](./packages/jest-environment-glaze)     | Glaze environment for Jest tests                                                                          | ![npm version](https://img.shields.io/npm/v/jest-environment-glaze.svg)      |

## Example

An example notes taking app using Glaze libraries and tools with a webpack setup is available in the [`examples/webpack-notes`](examples/webpack-notes) folder.

## Maintainers

- Paul Le Cam ([@paullecam](http://github.com/paullecam))

## License

Dual licensed under [MIT](LICENSE-MIT) and [Apache 2](LICENSE-APACHE)
