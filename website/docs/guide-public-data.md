---
title: Reading public data
---

It is possible to interact with IDX in a **read-only** manner by providing a known DID to read from, such as:

```ts
import { IDX } from '@ceramicstudio/idx'

// See constructor options
const idx = new IDX(...)

await idx.get('<Definition DocID>', '<Known DID>')
```

However, this only works if the content is **public**. If the content has been encrypted for a **specific recipient**, the [Ceramic instance](libs-types.md#ceramicapi) used by the [`IDX` instance](libs-idx.md#idx-class) **needs to be authenticated**.

It is possible to check if the Ceramic instance is authenticated directly on the `IDX` instance:

```ts
if (idx.authenticated) {
  await idx.get('<Definition DocID>')
}
```
