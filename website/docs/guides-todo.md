## Thinking in IDX

- Think as global DB: tables, rows and user ID
- Emphasis differences

## During dev lifecycle

1. Create a schema for you collection (or use existing one)
1. Create a collection definition (or use existing one)

These will have immutable DocIds that can be used to get/set data on the user's root index

## App bootstrapping

1. Create IDW, Ceramic and IDX instances
1. Authenticate user using IDW/Ceramic - will create a 3ID with an empty root index if needed

## App usage

- Use IDX instance to get/set specific collections used by your app

## App data discovery

- Add a tag for your app to the docs your app use for quick discovery
- Create your own Definition and store references as a sub-index
