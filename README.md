# Delir
Web Technology driven VFX Application.

Runs on Windows, macOS, Linux.

![screenshot](https://user-images.githubusercontent.com/8597982/51431908-d5c7c780-1c72-11e9-9f2a-4bee09200ffc.png)

## Concept

- **Movie Production with Programming**
  - First class `p5.js` support for video production
  - Can be make custom post processing plugin with HTML5 Canvas and WebGL
- Standalone engine (`@delirvfx/core`) for makes your VFX app
  - Modern and simple software architecture
- Works on Web technology for rapid development (Fully TypeScript, HTML5, Canvas and WebGL)

## Feature

- Video, Image, Audio, Text and P5.js support
- Adjustment clip
- Keyframe animation editor
  - With Expression support by JavaScript(TypeScript)
- Post processing plugin support with Canvas2DContext and WebGL(experimental, now in develop)
- Rendering to mp4(H.264 + aac) with ffmpeg

## For developer

### How to develop Post processing plugin
See [plugin-example](https://github.com/ra-gg/Delir/tree/master/packages/core/plugin-example)

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
  - **core**  -- Core module codes called `@delirvfx/core` (Project structure, engine, calculation, renderer)
  - **deream** -- Renderered frame exporter for ffmpeg
  - **plugins** -- Built-in Delir plugins (build with webpack)

## OpenCollective
### Buckers
[![](https://opencollective.com/delirvfx/backers.svg?width=890)](https://opencollective.com/delirvfx)
