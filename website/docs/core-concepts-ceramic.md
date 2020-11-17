---
title: What is Ceramic?
slug: /concepts/ceramic
---

In IDX, **Ceramic** is a decentralized network used for storing DIDs (such as [3ID](core-concepts-dids.md)) and IDX documents including [indexes](core-concepts-index.md), [definitions](core-concepts-definitions.md), [references](core-concepts-references.md), and [schemas](core-concepts-schemas.md). IDX uses the Ceramic API, which is exposed by the [`js-ceramic` client](https://github.com/ceramicnetwork/js-ceramic).

## Core Concepts

### Network
Ceramic is a decentralized and permissionless network for managing mutable, verifiable documents in a global context. Anyone can run a Ceramic node and join the public network to query and/or write documents.

### Documents
A document is a representation of structured data on the Ceramic network along with its metadata. IDX provides various high-level interfaces interacting with these documents.

### DocID
A document identifier (DocID) is a URL that uniquely represents a document on Ceramic. Multiple APIs in IDX use DocIDs as inputs and/or outputs.

## Further Reading
For more information on Ceramic, view the Ceramic [website](https://ceramic.network) or [Github](https://github.com/ceramicnetwork/ceramic).
