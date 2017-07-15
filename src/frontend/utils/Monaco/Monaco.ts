import {join} from 'path'

const {global} = (window as any)
const baseDir = 'file://' + join(global.__dirname, '../../node_modules/monaco-editor/min/vs')

// Stash node's `require`
const nodeRequire = global.require

// Stash `global.module` for monaco's fucking css loader
const _globalModule = global.module
global.module = void 0
global.process.browser = true

const loaderLoadedHandler = () => {
    // Stash AMDLoader's require / restore node's require
    const amdRequire = global.require
    global.require = nodeRequire
    global.define.amd = true

    amdRequire.config({
        paths: {
            vs: baseDir,
        },
    })

    amdRequire(['vs/editor/editor.main'], () => {
        global.module = _globalModule
        delete global.process.browser

        // Load EcmaScript TypeDefinitions
        ;[
            ['lib.es5.d.ts', require('!raw-loader!typescript/lib/lib.es5.d.ts')],
            ['lib.es2015.collection.d.ts', require('!raw-loader!typescript/lib/lib.es2015.collection.d.ts')],
            ['lib.es2015.core.d.ts', require('!raw-loader!typescript/lib/lib.es2015.core.d.ts')],
            ['lib.es2015.generator.d.ts', require('!raw-loader!typescript/lib/lib.es2015.generator.d.ts')],
            ['lib.es2015.iterable.d.ts', require('!raw-loader!typescript/lib/lib.es2015.iterable.d.ts')],
            ['lib.es2015.promise.d.ts', require('!raw-loader!typescript/lib/lib.es2015.promise.d.ts')],
            ['lib.es2015.proxy.d.ts', require('!raw-loader!typescript/lib/lib.es2015.proxy.d.ts')],
            ['lib.es2015.reflect.d.ts', require('!raw-loader!typescript/lib/lib.es2015.reflect.d.ts')],
            ['lib.es2015.symbol.d.ts', require('!raw-loader!typescript/lib/lib.es2015.symbol.d.ts')],
            ['lib.es2015.symbol.wellknown.d.ts', require('!raw-loader!typescript/lib/lib.es2015.symbol.wellknown.d.ts')],
            ['lib.es2016.array.include.d.ts', require('!raw-loader!typescript/lib/lib.es2016.array.include.d.ts')],
            ['console.d.ts', require('!raw-loader!./console.d.ts.txt')],
        ].forEach(([fileName, typeDef]) => {
            monaco.languages.typescript.typescriptDefaults.addExtraLib(typeDef, fileName)
        })
    })
}

// Load monaco-editor
const script = document.createElement('script')
script.src = baseDir + '/loader.js'
script.async = false
script.onload = loaderLoadedHandler
document.head.appendChild(script)
