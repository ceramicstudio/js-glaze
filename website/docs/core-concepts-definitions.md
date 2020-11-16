---
title: What is a Definition?
slug: /concepts/definition
---

In IDX, the **definition** is a document created by a developer which includes metadata about a data set found in an [index](core-concepts-index.md). It is used to describe the data they wish to store with the user in a structured way. The [DocID](core-concepts-ceramic.md#docid) of the definition is used as a key in the user's index, which points to the DocID of a corresponding [reference](core-concepts-reference.md). Definitions allow user-centric data (references) to be discoverable and queryable according based on any of the metadata found below. Developers only need to create a definition once, and it can then be used as a key in any number of indexes.

In IDX, definitions are stored on the [Ceramic Network](core-concepts-ceramic.md).

## What's included in a definition?

- `schema` (required): the DocID of the [schema](core-concepts-schemas.md) that will be used to validate the reference contents

- `name` (required): a name of the definition, helping unique identification and discovery

- `description` (optional): a short description of the definition, to help with discovery

- `url` (optional): a URL of the specification for the definition or the associated project

- `config` (optional): any additional contents that may be needed by applications to support additional logic when interacting with the reference
