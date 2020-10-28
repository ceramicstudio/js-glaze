---
title: Getting started with the CLI
---

## Prerequisites

The Ceramic and IDX CLIs require the [Node.js runtime](https://nodejs.org/en/) and the npm CLI to be installed.

If you have not installed the Ceramic CLI, it is recommended you use it alongside the IDX CLI, otherwise you will have to use a remote Ceramic server:

```sh
npm install --global @ceramicnetwork/ceramic-cli
```

## Installation

```sh
npm install --global @ceramicstudio/idx-cli
```

The CLI should then be accessible as `idx`.

## Up and running

Most commands of the IDX CLI need to communicate with a Ceramic HTTP server, using one of the following options:

### Explicit flag

By setting the `--ceramic` flag when running a command, it is possible to specify what Ceramic HTTP URL to use, for example:

```sh
idx index:check <did> --ceramic=https://my-ceramic-server.tld
```

### Environment variable

If present, the `CERAMIC_URL` environment variable will be used by the CLI, for example on a UNIX system:

```sh
CERAMIC_URL=https://my-ceramic-server.tld idx index:check <did>
```

### CLI configuration

Instead of having to explicitely provide a command flag or environment variable, the default Ceramic HTTP URL to connect to can be stored in a configuration used by the CLI, such as:

```sh
idx config:set ceramic-url https://my-ceramic-server.tld
```

The `config:get` command can be used to check the URL stored in configuration:

```sh
idx config:get ceramic-url
```

### Local Ceramic daemon (default)

If no other method is provided, the CLI will fallback to use the default URL of the Ceramic daemon: `http://localhost:7007`.

If you see an error when using the IDX CLI stating it can't connect to `http://localhost:7007`, it means no other URL has been provided and the Ceramic daemon is not running.

To start the Ceramic daemon, having the Ceramic CLI installed as [instructed above](#prerequisites), simply run the `daemon` command:

```sh
ceramic daemon
```

## Bootstrap Ceramic for IDX

The IDX library relies on some Ceramic documents used as schemas and definitions from the IDX specifications to be accessible on the Ceramic network.

When using the main Ceramic network and public testnets it is likely these documents would already be present, but for private test networks and local nodes, you may have to ensure these documents are created before using IDX.

In order to bootstrap a Ceramic network with the necessary IDX documents, simply run the `bootstrap` command:

```sh
idx bootstrap
```

## Create your DID

IDX uses Decentralized Identifiers (DID) for authentication and Identity Index documents are therefore controlled by a DID.

Before being able to interact with the Identity Index document, it is necessary to create the DID that will control it.
This can easily be done using the IDX CLI:

```sh
idx did:create --label=me
```

Here we also set the optional `label` flag as a local identifier for the DID, providing a simpler way to reference it.

It is possible to display all the locally created DIDs and their labels by running the `did:list` command:

```sh
idx did:list
```

## Check IDX support

By running then `index:check` it is possible to check if a given DID supports IDX.

Assuming you have created a DID using the step above, you can run the command to confirm your DID can be used with IDX:

```sh
idx index:check me
```

## Interact with IDX

Finally, once all the steps above have been successfully followed, you can start interacting with contents in your Identity Index, for example setting your basic profile using the provided IDX definition:

```sh
idx index:set me basicProfile '{"name":"Alice"}'
```

By running the `index:get` command, you can check the stored document contents:

```sh
idx index:get me basicProfile
```

All the commands provided by the IDX CLI can be found in [the CLI documentation](https://github.com/ceramicstudio/idx-cli#usage).
