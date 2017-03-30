# Delir plugin example
Example plugin of Delir.
Can uses as plugin boilerplate it.

## How to start development
Require `node.js` and `yarn`

```shell
# Put below commands into shell
yarn install
yarn dev
```

## Structure
- package.json - plugin information
- src - Plugin source code
    - index.ts - Entry point
- dist - Compiled plugin codes

## package.json fields
### engines.delir
Specify supported delir version

```json
{
    "engines": {
        "delir": "0.0.x" // => Support delir v0.0.*
    }
}
```

### delir
Write about this plugin.

```json
{
  "delir": {
    "feature": "CustomLayer",
    "targetApi": {
        "renderer": "0.0.x"
    },
    "acceptFileTypes": {
        // "mimetype": "default assign property name"
        "video/mp4": "source"
    }
  }
}
```