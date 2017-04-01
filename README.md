# Delir
Web Technology driven VFX Application


## For developer

### Run Delir for development
1. Delir depends to below softwares.  
  You must install the above program before starting development.

  - Node.js 6+
  - yarn ([yarnpkg/yarn](https://github.com/yarnpkg/yarn))
  - ffmpeg

2. clone this repository
  ```
  git clone git@github.com:Ragg-/delir.git
  git checkout alpha-release
  ```

3. install dependent node modules
  ```
  yarn install
  ```
  
4. Start development
  ```
  yarn dev
  ```

### Path to code
- src
  - **browser**  -- BrowserProcess codes
  - **delir-core**  -- Core module codes (Project structure, calculation, renderer)
  - **deream** -- Renderered frame exporter for ffmpeg (deprecated)
  - **plugins** -- Built-in Delir plugins (build with webpack)
  - **renderer** -- RendererProcess codes. It is composed with Flux architecture.
    - **actions** -- ActionCreator classes
    - **devel** -- Codes for development (Fixture project contained)
    - **helpers** -- Helper libraries (it [MUST] be staticaly)
    - **services** -- Store+ActionCreator composed classes (Delir renderer delegation, etc...)
    - **stores** -- Store classes
    - **views** -- View components
      - **components** -- Application shared components
