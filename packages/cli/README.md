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
- [`glaze model:export NAME [OUTPUT]`](#glaze-modelexport-name-output)
- [`glaze model:import LOCALNAME IMPORTNAME`](#glaze-modelimport-localname-importname)
- [`glaze model:inspect NAME`](#glaze-modelinspect-name)
- [`glaze model:list`](#glaze-modellist)
- [`glaze model:publish NAME [OUTPUT]`](#glaze-modelpublish-name-output)
- [`glaze pin:add STREAMID`](#glaze-pinadd-streamid)
- [`glaze pin:ls [STREAMID]`](#glaze-pinls-streamid)
- [`glaze pin:rm STREAMID`](#glaze-pinrm-streamid)
- [`glaze stream:commits STREAMID`](#glaze-streamcommits-streamid)
- [`glaze stream:state STREAMID`](#glaze-streamstate-streamid)
- [`glaze tile:create CONTENT`](#glaze-tilecreate-content)
- [`glaze tile:deterministic METADATA`](#glaze-tiledeterministic-metadata)
- [`glaze tile:show STREAMID`](#glaze-tileshow-streamid)
- [`glaze tile:update STREAMID CONTENT`](#glaze-tileupdate-streamid-content)
- [`glaze tile:watch STREAMID`](#glaze-tilewatch-streamid)

### `glaze config:get KEY`

get a config value

```
USAGE
  $ glaze config:get KEY

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Key
```

### `glaze config:reset KEY`

reset a config value

```
USAGE
  $ glaze config:reset KEY

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Key
```

### `glaze config:set KEY VALUE`

set a config value

```
USAGE
  $ glaze config:set KEY VALUE

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Key
```

### `glaze config:show`

show the full config

```
USAGE
  $ glaze config:show

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Key
```

### `glaze did:create`

create a new DID

```
USAGE
  $ glaze did:create

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Key
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
  -k, --key=key          DID Key
  --did=did              DID
```

### `glaze did:inspect`

inspect the contents of a DID DataStore

```
USAGE
  $ glaze did:inspect

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Key
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
  -k, --key=key          DID Key
```

### `glaze did:set MODEL ALIAS CONTENTS`

get the contents of a record in a DID DataStore

```
USAGE
  $ glaze did:set MODEL ALIAS CONTENTS

ARGUMENTS
  MODEL     Model name or path to JSON file
  ALIAS     Definition alias
  CONTENTS  String-encoded JSON data

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Key
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
  -k, --key=key          DID Key
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
  -k, --key=key          DID Key
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
  -k, --key=key          DID Key
  --schema=schema        tile schema
```

### `glaze model:create NAME`

create a local model

```
USAGE
  $ glaze model:create NAME

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Key
```

### `glaze model:delete NAME`

delete a local model

```
USAGE
  $ glaze model:delete NAME

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -f, --force            bypass confirmation prompt
  -k, --key=key          DID Key
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
  -k, --key=key          DID Key
```

### `glaze model:import LOCALNAME IMPORTNAME`

import a model into another one

```
USAGE
  $ glaze model:import LOCALNAME IMPORTNAME

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Key
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
  -k, --key=key          DID Key
```

### `glaze model:list`

list local models

```
USAGE
  $ glaze model:list

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Key
```

### `glaze model:publish NAME [OUTPUT]`

publish a model

```
USAGE
  $ glaze model:publish NAME [OUTPUT]

ARGUMENTS
  NAME    local model name or package
  OUTPUT  JSON file to output the published aliases

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Key
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
  -k, --key=key          DID Key
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
  -k, --key=key          DID Key
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
  -k, --key=key          DID Key
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
  -k, --key=key          DID Key
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
  -k, --key=key          DID Key
```

### `glaze tile:create CONTENT`

create a new Tile stream

```
USAGE
  $ glaze tile:create CONTENT

ARGUMENTS
  CONTENT  stream contents (JSON encoded as string)

OPTIONS
  -c, --ceramic=ceramic    Ceramic API URL
  -g, --only-genesis       only generate genesis commit
  -k, --key=key            DID Key
  -m, --metadata=metadata  stream metadata
```

### `glaze tile:deterministic METADATA`

load a deterministic Tile stream

```
USAGE
  $ glaze tile:deterministic METADATA

ARGUMENTS
  METADATA  stream metadata

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Key
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
  -k, --key=key          DID Key
```

### `glaze tile:update STREAMID CONTENT`

Update a stream

```
USAGE
  $ glaze tile:update STREAMID CONTENT

ARGUMENTS
  STREAMID  ID of the stream
  CONTENT   new contents for the stream

OPTIONS
  -c, --ceramic=ceramic    Ceramic API URL
  -k, --key=key            DID Key
  -m, --metadata=metadata  Optional metadata for the stream
```

### `glaze tile:watch STREAMID`

monitor stream for any updates

```
USAGE
  $ glaze tile:watch STREAMID

ARGUMENTS
  STREAMID  ID of the stream

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key          DID Key
```

<!-- commandsstop -->

## License

Apache-2.0 OR MIT
