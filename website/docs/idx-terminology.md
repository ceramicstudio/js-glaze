---
title: Terminology
slug: /terminology
---

## DID

**Decentralized Identifiers (DIDs)** are globally unique persistent identifiers as defined by the [W3C DID specifications](https://www.w3.org/TR/did-core/).

## 3ID

A **3ID** is a [DID](#did) document using the `3` [method name](https://www.w3.org/TR/did-core/#did-syntax) and stored by the [Ceramic network](#ceramic).

A **3ID** notably stores the [DocID](#docid) of the [Identity Index](idx-terminology.md#identity-index--idx) used by the [IDX library](libs-idx.md).

## Ceramic

In this documentation, **Ceramic** can refer to either the [Ceramic network](https://www.ceramic.network/) itself, or an instance of a Ceramic API used by the the [IDX library](libs-idx.md), as exposed by the [`js-ceramic` repository](https://github.com/ceramicnetwork/js-ceramic).

## Document

A **Document** is a representation of structured data on the [Ceramic network](#ceramic) along with metadata. The [IDX library](libs-idx.md) provides high-level interfaces interacting with these documents.

## DocID

A **Document Identifier (DocID)** is a URL representing a [Document](#document). Multiple APIs in the [IDX library](libs-idx.md) use DocIDs as inputs and/or outputs.

## IndexKey

An **Index Key** is a key in the [Identity Index](#identity-index--idx). It should be treated as an opaque string.

## Identity Index / IDX

The **Identity Index** and **IDX** can sometimes both be used to refer to the [Identity Index specification CIP](https://github.com/ceramicnetwork/CIP/issues/3), but in this documentation the term **Identity Index** will always be used to refer to the [specification CIP](https://github.com/ceramicnetwork/CIP/issues/3), while **IDX** refers to the library, or possibly the [`IDX` class](libs-idx.md#idx-class) in code snippets.

The **Identity Index contents** refers to the mapping of a [Definition](#definition), represented by its [IndexKey](#indexkey), to a referenced [DocID](#docid).
The contents are stored in a [Document](#document) that the [IDX library](libs-idx.md) interacts with.

## Schema

A [JSON schema](https://json-schema.org/) may be used to validate the structure of a [Document](#document). These schemas may be defined in [Ceramic CIPs](https://github.com/ceramicnetwork/CIP), other specifications or created by developers for their application needs.

## Definition

A **Definition** is a specific type of [Document](#document) used by the [IDX library](libs-idx.md) to represent other documents in the [Identity Index](idx-terminology.md#identity-index--idx).

A **Definition** is based on a specific [Schema](#schema) describing the document it represents, notably the Schema used to validate the document.
