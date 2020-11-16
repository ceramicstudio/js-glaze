---
title: What is a Reference?
slug: /concepts/reference
---

In IDX, the **reference** is a document created by a user which includes the actual data (or additional pointers to the data) of a dataset found in their [index](core-concepts-index.md). The [DocID](core-concepts-ceramic.md#docid) of the reference is used as a value in the user's index. The key which identifies this reference in the index is the DocID of its corresponding [definition](core-concepts-definitions.md).

Unlike definitions which can function as a key in many indexes, references are unique to each user and each reference has a different DocID. References are usually created during the process of using an application.

In IDX, references are stored on the [Ceramic Network](core-concepts-ceramic.md).
