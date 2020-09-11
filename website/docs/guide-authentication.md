---
title: Understanding authentication
---

Authentication in [IDX](idx-terminology.md#identity-index--idx) and [Ceramic](idx-terminology.md#ceramic) is based on [Decentralized Identifiers (DIDs)](idx-terminology.md#did).

## Reading from a known Identity Index

It is possible to interact with IDX in a **read-only** manner by providing a known DID to read from, such as:

```ts
import { IDX } from '@ceramicstudio/idx'

// See constructor options
const idx = new IDX(...)

await idx.get('<Definition DocID>', '<Known DID>')
```

However, this only works if the content is **public**. If the content has been encrypted for a **specific recipient**, the [Ceramic instance](lib-apis.md#ceramicapi) used by the [`IDX` instance](lib-apis.md#idx-class) **needs to be authenticated**.

It is possible to check if the Ceramic instance is authenticated and request authentication directly on the `IDX` instance:

```ts
if (!idx.authenticated) {
  await idx.authenticate()
}
```

## Writing and reading when authenticated

Once successufully authenticated, it is possible to write to the [Identity Index](idx-terminology.md#identity-index--idx) associated to the DID, for example using the [`set` method](lib-apis.md#set):

```ts
await idx.set('<Definition DocID>', { hello: 'world' })
```

It is also possible to omit providing the DID in the reading methods:

```ts
const content = await idx.get('<Definition DocID>')
```

In this case, IDX will use the authenticated DID as fallback.
