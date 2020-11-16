---
title: What is a DID?
slug: /concepts/dids
---

DIDs is a standard for globally-unique persistent decentralized identifiers specified by the [W3C](https://www.w3.org/TR/did-core/). The DID is a string identifier that resolves to a document which contains various pieces of metadata about the DID. The DID document usually contains public keys used for signature verification and encryption, and optionally other metadata. 

IDX uses DIDs for indentifiers ([see below](#supported-implementations)) and also uses the DID document to store the [DocID](core-concepts-ceramic.md#docid) of the user's [index](core-concepts-index.md).

## Specification

There are currently more than 60 implementations of DID, referred to as DID [methods](https://www.w3.org/TR/did-core/#did-syntax). 

### Identifier

Each DID method follows the same basic format for a string identifier:

```
did:<did-method>:<unique-string>
```

An example DID for the 3ID method:

```
did:3:bfhriefbjhlebrlwbwebrflwebfwlebfwerbfwehbweljkrhbflewuib
```

### DID Document

Every DID must resolve to a document which contains metadata about the DID.


## Supported Implementations

### 3ID DID Method

3ID is the primary DID method used in IDX. As shown above in the example, it uses the method name `3`. 3IDs are stored as documents on the [Ceramic Network](core-concepts-ceramic.md). Notably, IDX uses the 3ID document to store the [DocID](core-concepts-ceramic.md#docid) of the user's [index](core-concepts-index.md).

