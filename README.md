# Delir
Web Technology driven VFX Application

## How to develop Delir plugin
See [plugin-example](https://github.com/Ragg-/Delir/tree/alpha-release/src/delir-core/plugin-example)

## For developer

### Run Delir for development
1. Delir depends to below softwares.
  You must install the above program before starting development.

  - Node.js 6+
    `brew install node`
  - yarn ([yarnpkg/yarn](https://github.com/yarnpkg/yarn))
    `npm i -g yarn`
  - node-gyp
    `npm i -g node-gyp`
  - ffmpeg
    `brew install ffmpeg`

2. clone this repository
  ```
  git clone git@github.com:Ragg-/delir.git
  git checkout release/0.0.0-alpha.4
  ```

3. install dependent node modules
  ```
  ./setup.sh
  ```

4. Start development
  ```
  yarn dev
  ```

  Ctrl+C to interrupt

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
