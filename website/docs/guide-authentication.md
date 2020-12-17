---
title: Using authentication
---

Authentication in [IDX](idx-terminology.md#identity-index--idx) and [Ceramic](idx-terminology.md#ceramic) is based on [Decentralized Identifiers (DIDs)](idx-terminology.md#did).

## Checking and authenticating the Ceramic instance

```ts
if (ceramic.did == null) {
  // Attach a DID provider to the Ceramic instance to authenticate
  await ceramic.setDIDProvider(provider)
}
const idx = new IDX({ ceramic })
```

## Writing and reading when authenticated

Once successufully authenticated, it is possible to write to the [Identity Index](idx-terminology.md#identity-index--idx) associated to the DID, for example using the [`set` method](libs-idx.md#set):

```ts
await idx.set('<Definition DocID>', { hello: 'world' })
```

It is also possible to omit providing the DID in the reading methods:

```ts
const content = await idx.get('<Definition DocID>')
```

In this case, IDX will use the authenticated DID of the Ceramic instance as fallback.
