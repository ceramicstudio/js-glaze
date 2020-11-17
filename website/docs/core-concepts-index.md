---
title: What is an Index?
slug: /concepts/index
---

In IDX, the index document is a key-value store for associating and discovering data and resources for a [DID](core-concepts-dids.md). It is the critical component which enables discoverability, interoperability, and portability of user information across domains or applications.

The index document contains a list of mappings of [DocIDs](core-concepts-ceramic.md#docid) from data [definitions](core-concepts-definitions.md) to [references](core-concepts-references.md) for all data associated with a given DID. The index document is owned by a DID and the DocID of the index is registed in their [DID document](core-concepts-dids.md#did-document). In IDX, index documents are stored on the [Ceramic Network](core-concepts-ceramic.md).

The complete technical specification for IDX indexes can be found [here](https://github.com/ceramicnetwork/CIP/blob/master/CIPs/CIP-11/CIP-11.md).
