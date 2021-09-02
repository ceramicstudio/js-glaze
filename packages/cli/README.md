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

### `glaze config:get KEY`

get a config value

```
USAGE
  $ glaze config:get KEY

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key    DID Key
```

### `glaze config:reset KEY`

reset a config value

```
USAGE
  $ glaze config:reset KEY

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key    DID Key
```

### `glaze config:set KEY VALUE`

set a config value

```
USAGE
  $ glaze config:set KEY VALUE

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key    DID Key
```

### `glaze config:show`

show the full config

```
USAGE
  $ glaze config:show

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key    DID Key
```

## `glaze did:create`

create a new DID

```
USAGE
  $ glaze did:create

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key    DID Key
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
  -k, --key=key    DID Key
  --did=did              DID
```

### `glaze did:inspect`

inspect the contents of a DID DataStore

```
USAGE
  $ glaze did:inspect

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key    DID Key
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
  -k, --key=key    DID Key
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
  -k, --key=key    DID Key
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
  -k, --key=key    DID Key
```

## `glaze did:verify JWS`

verify a JSON Web Signature

```
USAGE
  $ glaze did:verify JWS

ARGUMENTS
  JWS  JSON Web Signature

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key    DID Key
```

## `glaze help [COMMAND]`

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
  STREAM  Stream ID or string-encoded JSON content

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key    DID Key
```

### `glaze model:create NAME`

create a local model

```
USAGE
  $ glaze model:create NAME

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key    DID Key
```

## `glaze model:delete NAME`

delete a local model

```
USAGE
  $ glaze model:delete NAME

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -f, --force            bypass confirmation prompt
  -k, --key=key    DID Key
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
  -k, --key=key    DID Key
```

### `glaze model:import LOCALNAME IMPORTNAME`

import a model into another one

```
USAGE
  $ glaze model:import LOCALNAME IMPORTNAME

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key    DID Key
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
  -k, --key=key    DID Key
```

### `glaze model:list`

list local models

```
USAGE
  $ glaze model:list

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -k, --key=key    DID Key
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
  -k, --key=key    DID Key
```

## License

Apache-2.0 OR MIT
