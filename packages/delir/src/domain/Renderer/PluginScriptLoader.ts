import * as Delir from '@delirvfx/core'
import fs from 'fs'
import Module = require('module')
import path from 'path'
import vm from 'vm'

export default class PluginScriptLoader {
  public static load(path: string) {
    const loader = new PluginScriptLoader()
    return loader.loadScript(path)
  }

  private module: Module

  private loadScript(fullPath: string): any {
    const dirname = path.parse(fullPath).dir
    const script = fs.readFileSync(fullPath).toString()

    return this.executeScript(script, fullPath, dirname)
  }

  private executeScript(script: string, filename: string, dirname: string) {
    const require = this.makeRequire(filename)
    const mod = this.makeModule(filename)
    const scriptRunner = vm.runInNewContext(Module.wrap(script), {
      document,
      console,
    })
    scriptRunner(mod.exports, require, mod, filename, dirname)
    return mod.exports
  }

  private makeModule(filename: string) {
    this.module = new Module(filename)
    return this.module
  }

  private makeRequire(fullpath: string) {
    const requireFunc: any = (request: string) => {
      if (request === '@ragg/delir-core' || request === '@delirvfx/core') {
        return Delir
      }

      return this.module.require(request)
    }

    return requireFunc
  }
}
