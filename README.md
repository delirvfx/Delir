# Electron-boilerplate
Development environment and Foundation feature kit for Electron

## How to use
1. This boilerplate uses `gulp`.
   Please install `node.js(or iojs)` and `gulp` before setup.

2.  Next, clone this repo to your workspace.
    And move to the cloned workspace.
    ``` shell
    git clone https://github.com/Ragg-/electron-boilerplate.git /path/to/cloning
    cd /path/to/cloning
    ```

3. Install npm modules.
    ``` shell
    npm i
    ```

4. Run gulp `package-json` task.
   ``` shell
   gulp package-json
   ```

5. Move to `src/`, and install app's dependent npm modules
   ``` shell
   cd src/
   npm i
   ```

6. Move to workspace root, run gulp, start developing!
   ``` shell
   cd ../
   gulp
   ```

## Develop environment
- For Renderer process code building
    - `Webpack`
    - `Stylus`
    - `CoffeeScript`
    - `Jade`


- For debugging
    - `electron-connect`


## Builtin feature
### Command flow
- app.command.dispatch("&lt;command name&gt;"[, arguments...])
- app.command.on("&lt;command name&gt;"[, arguments...])

`CommandManager(on Browser, Renderer)` provides transparent access between Browser and Render.  
CommandManger explodes to `global.app.command (on Browser)` or `window.app.command (on Renderer)`.

CommandManger extends EventEmitter3. If you want to handle some commands,  
call `app.command.on("<command name>", <listener>)` method!

If you want to dispatch the command, call `app.command.dispatch("<command name>"[, arguments...])`.

`command.dispatch` dispatches a command to Browser and Renderer (not to other Renderer processes)

### Application menu (with scriptable defintion)
_(It's only used on Browser process)_

Application menu definitions are in `src/browser/config/menus/{platform}.coffee`  
`TODO: Write this section`

### Multiple windows management
`TODO: Write this section`

### CSS selector-based context menu
_(It's only used on Renderer process)_

- app.contextMenu.add("&lt;selector&gt;", &lt;electron's menu template object&gt;)

`TODO: Write this section`
