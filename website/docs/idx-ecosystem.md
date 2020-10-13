---
title: Ecosystem
slug: /ecosystem
---

## Technologies used by IDX

### Ceramic

IDX interacts with the [Ceramic network](https://www.ceramic.network/) to store and access documents.

### Identity Wallet

[Identity Wallet](https://github.com/3box/identity-wallet-js) is used to authenticate DIDs using Ceramic.

### 3ID Connect

[3ID Connect](https://github.com/3box/3id-connect) provides an iframe-based version of Identity Wallet that can be used by Web applications.

## IDX libraries

### IDX

The main [IDX library](libs-idx.md) used to interact with IdentityIndex documents.

### IDX Tools

The [IDX Tools library](libs-tools.md) provides development utilities to help build applications leveraging IDX.

### IDX Web

The [IDX Web library](libs-web.md) extends the main IDX library with browser-specific features, notably authenticating using 3ID Connect.

## Other tools

### Ceramic CLI

The [Ceramic CLI](https://github.com/ceramicnetwork/js-ceramic/tree/develop/packages/ceramic-cli#ceramic-cli) can be used to run a local Ceramic node.

### IDX CLI

The [IDX CLI](https://github.com/ceramicstudio/idx-cli#idx-cli) provides various commands to interact with DIDs and Identity Index documents, as introduced in this [getting started guide](guide-cli.md).
