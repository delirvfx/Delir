# Delir
Web Technology driven VFX Application

![screenshot](https://user-images.githubusercontent.com/8597982/51431908-d5c7c780-1c72-11e9-9f2a-4bee09200ffc.png)

## How to develop Delir plugin
See [plugin-example](https://github.com/ra-gg/Delir/tree/master/packages/delir-core/plugin-example)

## For developer

### Run Delir for development
1. Delir depends to below softwares.
  You must install the above program before starting development.

  - Node.js 10+
    `brew install node`
  - yarn ([yarnpkg/yarn](https://github.com/yarnpkg/yarn))
    `npm i -g yarn`
  - node-gyp
    `npm i -g node-gyp`
  - ffmpeg
    `brew install ffmpeg`

2. Clone this repository
  ```
  git clone git@github.com:ra-gg/delir.git
  ```

3. Install dependency and start development
  ```
  yarn dev
  ```

  Ctrl+C to interrupt

#### Production building
Now only building for development machine platform. (mac / win)
Native module can not build for another platform.

```
yarn build
```

### Path to code
- packages
  - **delir**  -- Electron frontend of Delir
    - **domain**  -- Operation / Action / Store / Utils set by domain
      - **Editor**  -- Editor state and actions
      - **Preference**  -- Editor preference state and actions
      - **Project**  -- Project(Document) state and actions
      - **Renderer**  -- Delir engine state and actions
    - **modules**  -- Modal windows
    - **utils**  -- View utilities non relate some domain
    - **views**  -- View components
  - **delir-core**  -- Core module codes (Project structure, engine, calculation, renderer)
  - **deream** -- Renderered frame exporter for ffmpeg
  - **plugins** -- Built-in Delir plugins (build with webpack)
