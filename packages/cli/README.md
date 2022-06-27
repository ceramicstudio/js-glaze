
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
- [`glaze did:generate-seed SEED`](#glaze-didgenerateseed)
- [`glaze did:from-seed`](#glaze-didfromseed)
- [`glaze did:create`](#glaze-didcreate)
- [`glaze did:get MODEL ALIAS`](#glaze-didget-model-alias)
- [`glaze did:inspect`](#glaze-didinspect)
- [`glaze did:merge MODEL ALIAS CONTENTS`](#glaze-didmerge-model-alias-contents)
- [`glaze did:set MODEL ALIAS CONTENTS`](#glaze-didset-model-alias-contents)
- [`glaze did:sign CONTENTS`](#glaze-didsign-contents)
- [`glaze did:verify JWS`](#glaze-didverify-jws)
- [`glaze help [COMMAND]`](#glaze-help-command)
- [`glaze model:create CONTENT`](#glaze-modelcreate-content)
- [`glaze model:content STREAMID`](#glaze-modelcontent-streamid)
- [`glaze model:controller STREAMID`](#glaze-modelcontroller-streamid)
- [`glaze composite:create INPUT`](#glaze-compositecreate)
- [`glaze composite:from-model STREAMIDS`](#glaze-compositefrommodel-streamids)
- [`glaze composite:extract-model PATH MODELS`](#glaze-compositeextractmodel-path-models)
- [`glaze composite:merge PATHS`](#glaze-compositemerge-paths)
- [`glaze composite:models PATH`](#glaze-compositemodels-path)
- [`glaze composite:deploy PATH`](#glaze-compositedeploy-path)
- [`glaze composite:compile PATH OUTPUTPATHS`](#glaze-compositecompile-path-outputpaths)
- [`glaze model-instance:create MODELSTREAMID CONTENT`](#glaze-modelinstancecreate-modelstreamid-content)
- [`glaze model-instance:replace STREAMID CONTENT`](#glaze-modelinstancereplace-streamid-content)
- [`glaze model-instance:content STREAMID`](#glaze-modelinstancecontent-streamid)
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

### `glaze did:generate-seed`

generate a new random 32 byte seed and return its base 16 representation

```
USAGE
  $ glaze did:generate-seed
```

### `glaze did:from-seed`

create a new DID from seed passed either as an argument or as a value of the flag

```
USAGE
  $ glaze did:from-seed SEED
  
OPTIONS
  --did-key-seed  A random 32 byte seed represented as a base16 string (pass only if not passed as positional argument)
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

### `glaze model:create CONTENT`

create a model stream with given content

```
USAGE
  $ glaze model:create CONTENT

ARGUMENTS
  CONTENT contents of the model encoded as JSON

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze model:content STREAMID`

load the contents of a model stream with a given ID

```
USAGE
  $ glaze model:content STREAMID

ARGUMENTS
  STREAMID ID of the stream

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -o, --output           Path to a file where the content should be saved
```

### `glaze model:controller STREAMID`

load the model stream with a given ID and display its controller DID

```
USAGE
  $ glaze model:controller STREAMID

ARGUMENTS
  STREAMID ID of the stream

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

### `glaze composite:from-model`

create an encoded composite definition from a list of model stream ids

```
USAGE
  $ glaze composite:from-model PATH MODELS

ARGUMENTS
  PATH    a path to an encoded composite definition file
  MODELS  a list of models (identified by names of stream IDs) to extract from the given composite

OPTIONS
  -o, --output a path to file where the resulting encoded composite definition should be saved
```

### `glaze composite:extract-model`

create an encoded composite definition from another one by extracting given models

```
USAGE
  $ glaze composite:from-model STREAMIDS

ARGUMENTS
  STREAMIDS  a list of model stream ids separated by spaces

OPTIONS
  -o, --output a path to file where the resulting encoded composite definition should be saved
```

### `glaze composite:merge`

create an encoded composite definition by merging other composites

```
USAGE
  $ glaze composite:merge PATHS

ARGUMENTS
  PATHS  a list of paths to files containing encoded composites, separated by spaces

OPTIONS
  -e, --common-embeds  'all','none' or a list of comma-separated embeds to extract from input composites into the output composite
  -o, --output         a path to file where the resulting encoded composite definition should be saved
```

### `glaze composite:models`

display the list of models included in a composite

```
USAGE
  $ glaze composite:models PATH

ARGUMENTS
  PATH  a path to a file containing a composite's encoded definition

OPTIONS
  --id-only   display only the stream IDs of models included in the composite (exclusive to --table)
  --table     display the models in a table (excusive to --id-only)
```

### `glaze composite:deploy`

deploy models included in the composite on connected ceramic node

```
USAGE
  $ glaze composite:deploy PATH

ARGUMENTS
  PATH  a path to a file containing a composite's encoded definition
```

### `glaze composite:compile`

creates a runtime representation of the composite and saves it in given path(s)

```
USAGE
  $ glaze composite:compile PATH OUTPUTPATHS

ARGUMENTS
  PATH          a path to a file containing a composite's encoded definition
  OUTPUTPATHS   one or more paths to save runtime representation in. Supported extensions: .json, .js and .ts
```

### `glaze model-instance:create MODELSTREAMID CONTENT`

create a model instance stream with given content

```
USAGE
  $ glaze model-instance:create MODELSTREAMID CONTENT

ARGUMENTS
  MODELSTREAMID  streamID of the model whose instance is being created
  CONTENT        contents of the model instance encoded as JSON

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze model-instance:replace STREAMID CONTENT`

replace content in a model instance stream with given streamID

```
USAGE
  $ glaze model-instance:replace STREAMID CONTENT

ARGUMENTS
  STREAMID  streamID of the model instance whose content is being replaced
  CONTENT   new contents of the model instance encoded as JSON

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

### `glaze model-instance:content STREAMID`

load the contents of a model instance stream with a given ID

```
USAGE
  $ glaze model-instance:content STREAMID

ARGUMENTS
  STREAMID ID of the stream

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -o, --output           Path to a file where the content should be saved
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
