---
title: IDX Components
slug: /introduction/components
---

This page contains an overview of the libraries and components utilized within IDX.


## Application Libraries
JavaScript/TypeScript libraries used within your application.

### IDX

[`js-idx`](libs-idx.md) is the core library used to interact with the IDX protocol.

### IDX Web

[`js-web`](libs-web.md) extends `js-idx` with browser-specific features, notably authenticating using [3ID Connect](#3id-connect).


## Developer Utilities
Libraries used during development with IDX.

### IDX Tools

[idx-tools](libs-tools.md) provides development utilities for building applications using the IDX protocol.

### IDX CLI

[idx-cli](https://github.com/ceramicstudio/idx-cli#idx-cli) provides various commands to interact with DIDs and IDX documents, as introduced in this [getting started guide](guide-cli.md). Note, the `idx-cli` requires the Ceramic CLI below.


## Dependencies

IDX depends on [Ceramic](core-concepts-ceramic.md) for storing documents and [DIDs](core-concepts-dids.md) for identifiers and authentication, so these libraries will be needed in various places. When required, they will be referenced in-line in this documentation.

### Ceramic

#### Ceramic CLI

[Ceramic CLI](https://github.com/ceramicnetwork/js-ceramic/tree/develop/packages/ceramic-cli#ceramic-cli) can be used to run a local Ceramic node, which is needed for IDX.

### DID Providers

#### Identity Wallet

[Identity Wallet](https://github.com/3box/identity-wallet-js) is a DID Provider used to instantiate and authenticate [3IDs](core-concepts-dids.md#supported-implementations), allowing them to create, sign, and update documents on Ceramic.

#### 3ID Connect

[3ID Connect](https://github.com/ceramicstudio/3id-connect) provides an iframe-based version of Identity Wallet that can be used by Web applications. 3ID Connect allows users to rely on their existing Ethereum wallet for signing. Support for more blockchains is coming soon.
