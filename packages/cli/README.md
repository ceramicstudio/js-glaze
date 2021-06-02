# IDX CLI

## Installation

```sh
npm install -g @ceramicstudio/idx-cli
```

## Usage

```sh
idx COMMAND
```

<!-- commands -->
* [`idx bootstrap`](#idx-bootstrap)
* [`idx config:get KEY`](#idx-configget-key)
* [`idx config:reset KEY`](#idx-configreset-key)
* [`idx config:set KEY VALUE`](#idx-configset-key-value)
* [`idx config:show`](#idx-configshow)
* [`idx definition:check ID`](#idx-definitioncheck-id)
* [`idx definition:create DID`](#idx-definitioncreate-did)
* [`idx definition:info ID`](#idx-definitioninfo-id)
* [`idx definition:schema ID`](#idx-definitionschema-id)
* [`idx did:create`](#idx-didcreate)
* [`idx did:delete DID`](#idx-diddelete-did)
* [`idx did:label DID [LABEL]`](#idx-didlabel-did-label)
* [`idx did:list`](#idx-didlist)
* [`idx did:sign DID CONTENTS`](#idx-didsign-did-contents)
* [`idx did:verify JWS`](#idx-didverify-jws)
* [`idx help [COMMAND]`](#idx-help-command)
* [`idx index:get DID KEY`](#idx-indexget-did-key)
* [`idx index:inspect DID`](#idx-indexinspect-did)
* [`idx index:merge DID KEY CONTENTS`](#idx-indexmerge-did-key-contents)
* [`idx index:set DID KEY CONTENTS`](#idx-indexset-did-key-contents)
* [`idx schema:publish DID SCHEMA`](#idx-schemapublish-did-schema)
* [`idx tile:create DID CONTENTS`](#idx-tilecreate-did-contents)
* [`idx tile:get ID`](#idx-tileget-id)
* [`idx tile:merge DID ID CONTENTS`](#idx-tilemerge-did-id-contents)
* [`idx tile:set DID ID CONTENTS`](#idx-tileset-did-id-contents)

## `idx bootstrap`

bootstrap IDX on a Ceramic node

```
USAGE
  $ idx bootstrap

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/bootstrap.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/bootstrap.js)_

## `idx config:get KEY`

get a config value

```
USAGE
  $ idx config:get KEY

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/config/get.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/config/get.js)_

## `idx config:reset KEY`

reset a config value

```
USAGE
  $ idx config:reset KEY

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/config/reset.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/config/reset.js)_

## `idx config:set KEY VALUE`

set a config value

```
USAGE
  $ idx config:set KEY VALUE

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/config/set.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/config/set.js)_

## `idx config:show`

show the full config

```
USAGE
  $ idx config:show

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/config/show.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/config/show.js)_

## `idx definition:check ID`

check if a stream is a valid definition

```
USAGE
  $ idx definition:check ID

ARGUMENTS
  ID  stream ID to check

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/definition/check.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/definition/check.js)_

## `idx definition:create DID`

create a definition

```
USAGE
  $ idx definition:create DID

ARGUMENTS
  DID  DID to create the definition with

OPTIONS
  -c, --ceramic=ceramic          Ceramic API URL
  -d, --description=description  (required) description of the definition
  -n, --name=name                (required) name of the definition
  -s, --schema=schema            (required) schema for the definition contents
  -u, --url=url                  documentation URL for the definition
```

_See code: [lib/commands/definition/create.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/definition/create.js)_

## `idx definition:info ID`

displays information about a definition

```
USAGE
  $ idx definition:info ID

ARGUMENTS
  ID  stream ID or alias of the definition

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/definition/info.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/definition/info.js)_

## `idx definition:schema ID`

displays the schema for a definition contents

```
USAGE
  $ idx definition:schema ID

ARGUMENTS
  ID  stream ID or alias of the definition

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/definition/schema.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/definition/schema.js)_

## `idx did:create`

create a new DID

```
USAGE
  $ idx did:create

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -l, --label=label      label for the DID
  -s, --seed=seed        base16-encoded seed to use for the DID
```

_See code: [lib/commands/did/create.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/did/create.js)_

## `idx did:delete DID`

delete a local DID

```
USAGE
  $ idx did:delete DID

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -f, --force            bypass confirmation prompt
```

_See code: [lib/commands/did/delete.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/did/delete.js)_

## `idx did:label DID [LABEL]`

manage the label for a DID

```
USAGE
  $ idx did:label DID [LABEL]

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -d, --delete           delete the label
```

_See code: [lib/commands/did/label.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/did/label.js)_

## `idx did:list`

list the DIDs stored locally

```
USAGE
  $ idx did:list

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/did/list.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/did/list.js)_

## `idx did:sign DID CONTENTS`

create a JSON Web Signature

```
USAGE
  $ idx did:sign DID CONTENTS

ARGUMENTS
  DID       DID or label
  CONTENTS  String-encoded JSON data

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/did/sign.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/did/sign.js)_

## `idx did:verify JWS`

verify a JSON Web Signature

```
USAGE
  $ idx did:verify JWS

ARGUMENTS
  JWS  JSON Web Signature

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/did/verify.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/did/verify.js)_

## `idx help [COMMAND]`

display help for idx

```
USAGE
  $ idx help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `idx index:get DID KEY`

get the contents of a key in IDX

```
USAGE
  $ idx index:get DID KEY

ARGUMENTS
  DID  DID or label
  KEY

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/index/get.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/index/get.js)_

## `idx index:inspect DID`

inspect the contents of an IDX stream

```
USAGE
  $ idx index:inspect DID

ARGUMENTS
  DID  DID or label

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/index/inspect.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/index/inspect.js)_

## `idx index:merge DID KEY CONTENTS`

merge the contents of a key in IDX

```
USAGE
  $ idx index:merge DID KEY CONTENTS

ARGUMENTS
  DID       DID or label
  KEY
  CONTENTS  String-encoded JSON data

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/index/merge.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/index/merge.js)_

## `idx index:set DID KEY CONTENTS`

set the contents of a key in IDX

```
USAGE
  $ idx index:set DID KEY CONTENTS

ARGUMENTS
  DID       DID or label
  KEY
  CONTENTS  String-encoded JSON data

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/index/set.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/index/set.js)_

## `idx schema:publish DID SCHEMA`

publish a schema

```
USAGE
  $ idx schema:publish DID SCHEMA

ARGUMENTS
  DID     DID or label
  SCHEMA  String-encoded JSON schema

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/schema/publish.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/schema/publish.js)_

## `idx tile:create DID CONTENTS`

create a new tile stream

```
USAGE
  $ idx tile:create DID CONTENTS

ARGUMENTS
  DID       DID or label
  CONTENTS  String-encoded JSON data

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  -s, --schema=schema    StreamID of the schema validating the contents
```

_See code: [lib/commands/tile/create.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/tile/create.js)_

## `idx tile:get ID`

get the contents of a tile stream

```
USAGE
  $ idx tile:get ID

ARGUMENTS
  ID  Stream ID

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
  --did=did              DID or label
```

_See code: [lib/commands/tile/get.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/tile/get.js)_

## `idx tile:merge DID ID CONTENTS`

merge the contents of a tile stream

```
USAGE
  $ idx tile:merge DID ID CONTENTS

ARGUMENTS
  DID       DID or label
  ID        Stream ID
  CONTENTS  String-encoded JSON data

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/tile/merge.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/tile/merge.js)_

## `idx tile:set DID ID CONTENTS`

set the contents of a tile document

```
USAGE
  $ idx tile:set DID ID CONTENTS

ARGUMENTS
  DID       DID or label
  ID        Document ID
  CONTENTS  String-encoded JSON data

OPTIONS
  -c, --ceramic=ceramic  Ceramic API URL
```

_See code: [lib/commands/tile/set.js](https://github.com/ceramicstudio/js-idx/blob/v0.10.0/lib/commands/tile/set.js)_
<!-- commandsstop -->

## License

Apache-2.0 OR MIT
