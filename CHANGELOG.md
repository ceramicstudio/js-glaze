## v0.9.1 (2021-04-06)

Updated schemas and definitions IDs.

## v0.9.0 (2021-03-24)

Added support for `CAIP-10` accounts in `get()` and `has()` methods.

## v0.8.0 (2021-02-22)

Added `AlsoKnownAs` schema and `alsoKnownAs` definition to IDX constants and core.

## v0.7.0 (2021-01-19)

Updated `Definition` schema and definitions IDs.

## v0.6.0 (2021-01-14)

- Renamed `getIDXContent` method to `getIndex`
- Renamed `contentIterator` method to `iterator`
- Renamed various TypeScript definitions to match APIs changes

## v0.5.0 (2020-12-17)

- Updated to support Ceramic v0.17 - this changed the schemas and definitions IDs
- Removed the `authenticate` method and `did` property

## v0.4.0 (2020-12-02)

Updated to support Ceramic v0.15

## v0.3.0 (2020-10-29)

- Updated to support Ceramic v0.12 - this changed the schemas and definitions IDs
- Added `merge`, `setAll` and `setDefaults` methods

## v0.2.0 (2020-10-07)

- Updated to the [new IdentityIndex specification](https://github.com/ceramicnetwork/CIP/pull/65)
- Removed tags-related methods, being removed from the new specification
- Removed need to provide `schemas` in constructor, now using constants
- Added logic to validate the definitions and IDX documents use the right schema

## v0.1.0 (2020-09-15)

First release
