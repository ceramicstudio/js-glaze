# Glaze CLI

## [Documentation](https://developers.ceramic.network/tools/glaze/development/#cli)

## Installation

```sh
npm install -g @glazed/cli
```

## Usage

```sh
glaze COMMAND
```

<!-- commands -->

- [`glaze config:get KEY`](#glaze-configget-key)
- [`glaze config:reset KEY`](#glaze-configreset-key)
- [`glaze config:set KEY VALUE`](#glaze-configset-key-value)
- [`glaze config:show`](#glaze-configshow)
- [`glaze did:create`](#glaze-didcreate)
- [`glaze did:get MODEL ALIAS`](#glaze-didget-model-alias)
- [`glaze did:inspect`](#glaze-didinspect)
- [`glaze did:merge MODEL ALIAS CONTENTS`](#glaze-didmerge-model-alias-contents)
- [`glaze did:set MODEL ALIAS CONTENTS`](#glaze-didset-model-alias-contents)
- [`glaze did:sign CONTENTS`](#glaze-didsign-contents)
- [`glaze did:verify JWS`](#glaze-didverify-jws)
- [`glaze help [COMMAND]`](#glaze-help-command)
- [`glaze model:add NAME TYPE ALIAS STREAM`](#glaze-modeladd-name-type-alias-stream)
- [`glaze model:create NAME`](#glaze-modelcreate-name)
- [`glaze model:delete NAME`](#glaze-modeldelete-name)
- [`glaze model:deploy NAME [OUTPUT]`](#glaze-modeldeploy-name-output)
- [`glaze model:export NAME [OUTPUT]`](#glaze-modelexport-name-output)
- [`glaze model:import LOCALNAME IMPORTNAME`](#glaze-modelimport-localname-importname)
- [`glaze model:inspect NAME`](#glaze-modelinspect-name)
- [`glaze model:list`](#glaze-modellist)
- [`glaze composite:create INPUT [OUTPUT]`](#glaze-modellist)
- [`glaze pin:add STREAMID`](#glaze-pinadd-streamid)
- [`glaze pin:ls [STREAMID]`](#glaze-pinls-streamid)
- [`glaze pin:rm STREAMID`](#glaze-pinrm-streamid)
- [`glaze stream:commits STREAMID`](#glaze-streamcommits-streamid)
- [`glaze stream:state STREAMID`](#glaze-streamstate-streamid)
- [`glaze tile:create CONTENT`](#glaze-tilecreate-content)
- [`glaze tile:deterministic METADATA`](#glaze-tiledeterministic-metadata)
- [`glaze tile:content STREAMID`](#glaze-tileshow-streamid)
- [`glaze tile:update STREAMID CONTENT`](#glaze-tileupdate-streamid-content)
- [`glaze tile:show STREAMID`](#glaze-tileshow-streamid)

### `glaze config:get KEY`

get a config value

```
USAGE
  $ glaze config:get KEY

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze config:reset KEY`

reset a config value

```
USAGE
  $ glaze config:reset KEY

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze config:set KEY VALUE`

set a config value

```
USAGE
  $ glaze config:set KEY VALUE

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze config:show`

show the full config

```
USAGE
  $ glaze config:show

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze did:create`

create a new DID

```
USAGE
  $ glaze did:create

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze did:get MODEL ALIAS`

get the contents of a record in a DID DataStore

```
USAGE
  $ glaze did:get MODEL ALIAS

ARGUMENTS
  MODEL  Model name or path to JSON file
  ALIAS  Definition alias

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Private Key
  --did=did              DID
```

### `glaze did:inspect`

inspect the contents of a DID DataStore

```
USAGE
  $ glaze did:inspect

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Private Key
  --did=did              DID
```

### `glaze did:merge MODEL ALIAS CONTENTS`

merge the contents of a record in a DID DataStore

```
USAGE
  $ glaze did:merge MODEL ALIAS CONTENTS

ARGUMENTS
  MODEL     Model name or path to JSON file
  ALIAS     Definition alias
  CONTENTS  String-encoded JSON data

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Private Key
```

### `glaze did:set MODEL ALIAS CONTENTS`

set the contents of a record in a DID DataStore

```
USAGE
  $ glaze did:set MODEL ALIAS CONTENTS

ARGUMENTS
  MODEL     Model name or path to JSON file
  ALIAS     Definition alias
  CONTENTS  String-encoded JSON data

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Private Key
```

### `glaze did:sign CONTENTS`

create a JSON Web Signature

```
USAGE
  $ glaze did:sign CONTENTS

ARGUMENTS
  CONTENTS  String-encoded JSON data

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Private Key
```

### `glaze did:verify JWS`

verify a JSON Web Signature

```
USAGE
  $ glaze did:verify JWS

ARGUMENTS
  JWS  JSON Web Signature

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Private Key
```

### `glaze help [COMMAND]`

display help for glaze

```
USAGE
  $ glaze help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

### `glaze model:add NAME TYPE ALIAS STREAM`

add a stream to a model

```
USAGE
  $ glaze model:add NAME TYPE ALIAS STREAM

ARGUMENTS
  NAME
  TYPE    (schema|definition|tile)
  ALIAS
  STREAM  Stream reference or string-encoded JSON content

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  --schema=schema        tile schema
```

### `glaze model:create NAME`

create a local model

```
USAGE
  $ glaze model:create NAME

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze model:delete NAME`

delete a local model

```
USAGE
  $ glaze model:delete NAME

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -f, --force            bypass confirmation prompt
```

### `glaze model:deploy NAME [OUTPUT]`

deploy a model

```
USAGE
  $ glaze model:deploy NAME [OUTPUT]

ARGUMENTS
  NAME    local model name or package
  OUTPUT  JSON file to output the deployed model aliases

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze model:export NAME [OUTPUT]`

export a model

```
USAGE
  $ glaze model:export NAME [OUTPUT]

ARGUMENTS
  NAME    local model name or package
  OUTPUT  JSON file to output the model to

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze model:import LOCALNAME IMPORTNAME`

import a model into another one

```
USAGE
  $ glaze model:import LOCALNAME IMPORTNAME

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze model:inspect NAME`

inspect a model

```
USAGE
  $ glaze model:inspect NAME

ARGUMENTS
  NAME  local model name or package

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze model:list`

list local models

```
USAGE
  $ glaze model:list

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze composite:create`

create an encoded composite definition from GraphQL schema

```
USAGE
  $ glaze composite:create INPUT

ARGUMENTS
  INPUT  a path to file containing valid ceramic composite definition in GraphQL Schema Definition Language

OPTIONS
  -o, --output a path to file where the resulting encoded composite definition should be saved
```

### `glaze pin:add STREAMID`

pin a stream

```
USAGE
  $ glaze pin:add STREAMID

ARGUMENTS
  STREAMID  ID of stream to be pinned

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze pin:ls [STREAMID]`

list pinned streams

```
USAGE
  $ glaze pin:ls [STREAMID]

ARGUMENTS
  STREAMID  optional stream ID filter

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze pin:rm STREAMID`

unpin a stream

```
USAGE
  $ glaze pin:rm STREAMID

ARGUMENTS
  STREAMID  ID of stream to be unpinned

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze stream:commits STREAMID`

list commits contained within a stream

```
USAGE
  $ glaze stream:commits STREAMID

ARGUMENTS
  STREAMID  ID of the stream


OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -s, --sync  Controls if the current stream state should be synced over the network or not. 'prefer-cache' will return the state from the node's local cache if present, and will sync from the network if the stream isn't in the cache. 'always-sync' always syncs from the network, even if there is cached state for the stream. 'never-sync' never syncs from the network.
```

### `glaze stream:state STREAMID`

get the state of a Stream

```
USAGE
  $ glaze stream:state STREAMID

ARGUMENTS
  STREAMID  ID of the Stream

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -s, --sync  Controls if the current stream state should be synced over the network or not. 'prefer-cache' will return the state from the node's local cache if present, and will sync from the network if the stream isn't in the cache. 'always-sync' always syncs from the network, even if there is cached state for the stream. 'never-sync' never syncs from the network.
```

### `glaze tile:create`

create a new Tile stream

```
USAGE
  $ glaze tile:create

OPTIONS
  -b, --content=content    stream contents (JSON encoded as string)
  -c, --ceramic=ceramic    Ceramic API URL
  -k, --key=key            DID Private Key
  -m, --metadata=metadata  stream metadata
```

### `glaze tile:deterministic METADATA`

load a deterministic Tile stream, or create it if it doesn't already exist

```
USAGE
  $ glaze tile:deterministic METADATA

ARGUMENTS
  METADATA  stream metadata

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Private Key
  -s, --sync  Controls if the current stream state should be synced over the network or not. 'prefer-cache' will return the state from the node's local cache if present, and will sync from the network if the stream isn't in the cache. 'always-sync' always syncs from the network, even if there is cached state for the stream. 'never-sync' never syncs from the network.
```

### `glaze tile:content STREAMID`

show the contents of a Tile stream

```
USAGE
  $ glaze tile:content STREAMID

ARGUMENTS
  STREAMID  ID of the stream

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -s, --sync  Controls if the current stream state should be synced over the network or not. 'prefer-cache' will return the state from the node's local cache if present, and will sync from the network if the stream isn't in the cache. 'always-sync' always syncs from the network, even if there is cached state for the stream. 'never-sync' never syncs from the network.
```

### `glaze tile:update STREAMID`

Update a stream

```
USAGE
  $ glaze tile:update STREAMID

ARGUMENTS
  STREAMID  ID of the stream

OPTIONS
  -b, --content=content    new contents for the stream
  -c, --ceramic=ceramic    Ceramic API URL
  -k, --key=key            DID Private Key
  -m, --metadata=metadata  Optional metadata for the stream
```

### `glaze tile:show STREAMID`

show the contents of a Tile stream

```
USAGE
  $ glaze tile:show STREAMID

ARGUMENTS
  STREAMID  ID of the stream

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -s, --sync  Controls if the current stream state should be synced over the network or not. 'prefer-cache' will return the state from the node's local cache if present, and will sync from the network if the stream isn't in the cache. 'always-sync' always syncs from the network, even if there is cached state for the stream. 'never-sync' never syncs from the network.
```

<!-- commandsstop -->

## License

Apache-2.0 OR MIT
