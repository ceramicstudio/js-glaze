---
title: Terminology
---

## DID

**Decentralized Identifiers (DIDs)** are globally unique persistent identifiers as defined by the [W3C DID specifications](https://www.w3.org/TR/did-core/).

## 3ID

A **3ID** is a [DID](#did) document using the `3` [method name](https://www.w3.org/TR/did-core/#did-syntax) and stored by the [Ceramic network](#ceramic).

A **3ID** notably stores the [DocID](#docid) of the [Root Index](#root-index) used by the IDX library.

## Ceramic

In this documentation, **Ceramic** can refer to either the [Ceramic network](https://www.ceramic.network/) itself, or an instance of a Ceramic API used by the the IDX library, as exposed by the [`js-ceramic` repository](https://github.com/ceramicnetwork/js-ceramic).

## Document

A **Document** is a representation of structured data on the [Ceramic network](#ceramic) along with metadata. The IDX library provides high-level interfaces interacting with these documents.

## DocID

A **Document Identifier (DocID)** is a URL representing a [Document](#document). Multiple APIs in the IDX library use DocIDs as inputs and/or outputs.

## Identity Index / IDX

The **Identity Index** and **IDX** can sometimes both be used to refer to the [Identity Index specification CIP](https://github.com/ceramicnetwork/CIP/issues/3), but in this documentation the term **Identity Index** will always be used to refer to the [specification CIP](https://github.com/ceramicnetwork/CIP/issues/3), while **IDX** refers to the library, or possibly the [`IDX` class](lib-apis.md#idx-class) in code snippets.

## Schema

A [JSON schema](https://json-schema.org/) may be used to validate the structure of a [Document](#document). These schemas may be defined in [Ceramic CIPs](https://github.com/ceramicnetwork/CIP), other specifications or created by developers for their application needs.

## Definition

A **Definition** is a specific type of [Document](#document) used by the IDX library to represent other documents in the [Root Index](#root-index).

A **Definition** is based on a specific [Schema](#schema) describing the document it represents, notably the Schema used to validate the document.

## Entry

An **Entry** is a simple data structure containing of a `ref` [DocID](#docid) for the content [Document](#document), and a set of string `tags` used for content discovery.

## Root Index

The **Root Index** is the main [Document](#document) used by the IDX library to access and store the contents of the [Identity Index](#identity-index--idx).

The **Root Index** is a mapping of a [Definition](#definition), represented by its [DocID](#docid), to an [Entry](#entry).

The IDX library provides various APIs to interact with the **Root Index** and the associated [Definitions](#definition) and [Entries](#entry).
