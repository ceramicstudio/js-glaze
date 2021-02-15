# IDX monorepo

Packages providing the JavaScript/TypeScript implementation of the [IDX protocol](https://idx.xyz).

## Installation

This monorepo uses workspaces from npm v7, included with Node v15.
If you are using an older version of Node, make sure to install npm v7.

1. `npm install` to install the dependencies
1. `npm run build` to build all the packages

### Additional scripts

- `npm run lint` to run the linter in all packages
- `npm test` to run tests in all packages

## Packages

### IDX

- [`@ceramicstudio/idx`](https://developers.idx.xyz/reference/idx/) in [`packages/core`](packages/core)
- [`@ceramicstudio/idx-constants`](https://developers.idx.xyz/reference/idx-constants/) in [`packages/constants`](packages/constants)
- [`@ceramicstudio/idx-cli`](https://developers.idx.xyz/reference/idx-cli/) in [`packages/cli`](packages/cli)
- [`@ceramicstudio/idx-tools`](https://developers.idx.xyz/reference/idx-tools/) in [`packages/tools`](packages/tools)

### Jest environments

- `jest-environment-ceramic` in [`packages/jest-environment-ceramic`](packages/jest-environment-ceramic)
- `jest-environment-idx` in [`packages/jest-environment-idx`](packages/jest-environment-idx)

## Maintainers

- Paul Le Cam ([@paullecam](http://github.com/paullecam))

## License

Dual licensed under MIT and Apache 2
