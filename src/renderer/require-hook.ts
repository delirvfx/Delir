import * as Delir from '../delir-core/src/index'

// Hook require function for plugins
(() => {
    const Module = (global as any).module.constructor
    const _require = Module.prototype.require
    Module.prototype.require = function (this: any, module: string) {
        if (module === 'delir-core') {
            return Delir
        }

        return _require.call(this, module)
    }
})()
