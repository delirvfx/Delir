// @ts-ignore `import 'monaco-editor'` can't resolve in webpack
import {} from 'monaco-editor'
import { dirname } from 'path'

type AvailableLibrary =
    | 'lib.es5.d.ts'
    | 'lib.es2015.collection.d.ts'
    | 'lib.es2015.core.d.ts'
    | 'lib.es2015.generator.d.ts'
    | 'lib.es2015.iterable.d.ts'
    | 'lib.es2015.promise.d.ts'
    | 'lib.es2015.proxy.d.ts'
    | 'lib.es2015.reflect.d.ts'
    | 'lib.es2015.symbol.d.ts'
    | 'lib.es2015.symbol.wellknown.d.ts'
    | 'lib.es2016.array.include.d.ts'
    | 'console.d.ts'

interface LibraryEntry {
    name: string
    typedef: string
}

// Load EcmaScript TypeDefinitions
const typeDefinitionLibs = {
    'lib.es5.d.ts'                      : require('!raw-loader!typescript/lib/lib.es5.d.ts'),
    'lib.es2015.collection.d.ts'        : require('!raw-loader!typescript/lib/lib.es2015.collection.d.ts'),
    'lib.es2015.core.d.ts'              : require('!raw-loader!typescript/lib/lib.es2015.core.d.ts'),
    'lib.es2015.generator.d.ts'         : require('!raw-loader!typescript/lib/lib.es2015.generator.d.ts'),
    'lib.es2015.iterable.d.ts'          : require('!raw-loader!typescript/lib/lib.es2015.iterable.d.ts'),
    'lib.es2015.promise.d.ts'           : require('!raw-loader!typescript/lib/lib.es2015.promise.d.ts'),
    'lib.es2015.proxy.d.ts'             : require('!raw-loader!typescript/lib/lib.es2015.proxy.d.ts'),
    'lib.es2015.reflect.d.ts'           : require('!raw-loader!typescript/lib/lib.es2015.reflect.d.ts'),
    'lib.es2015.symbol.d.ts'            : require('!raw-loader!typescript/lib/lib.es2015.symbol.d.ts'),
    'lib.es2015.symbol.wellknown.d.ts'  : require('!raw-loader!typescript/lib/lib.es2015.symbol.wellknown.d.ts'),
    'lib.es2016.array.include.d.ts'     : require('!raw-loader!typescript/lib/lib.es2016.array.include.d.ts'),
    'console.d.ts'                      : require('!raw-loader!./console.d.ts.txt'),
}

export default class Monaco {

    public static setup(): Promise<void>
    {
        if ((window as any).monaco) return Promise.resolve()

        return new Promise(resolve => {
            const {global} = (window as any)

            // Avoid to module resolving by webpack. (global.require.resolve)
            // webpack resolves module as module number, it breaks dirname(string).
            const baseDir = 'file://' + dirname(global.require.resolve('monaco-editor/min/vs/loader.js'))

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

                    resolve()
                })
            }

            // Load monaco-editor
            const script = document.createElement('script')
            script.src = baseDir + '/loader.js'
            script.async = false
            script.onload = loaderLoadedHandler
            document.head.appendChild(script)
        })
    }

    public static registerLibrarySet(name: string, libs: (AvailableLibrary | LibraryEntry)[])
    {
        this.librarySet[name] = libs
    }

    public static activateLibrarySet(name: string)
    {
        if (this.activeLibrarySetDisposer) {
            this.activeLibrarySetDisposer()
        }

        const disposables = this.librarySet[name].map(lib => {
            if (typeof lib === 'string') {
                return monaco.languages.typescript.javascriptDefaults.addExtraLib(typeDefinitionLibs[lib], lib)
            } else {
                return monaco.languages.typescript.javascriptDefaults.addExtraLib(lib.typedef, lib.name)
            }
        })

        this.activeLibrarySetDisposer = () => disposables.forEach(d => d.dispose())
    }
    private static librarySet: {[setName: string]: (AvailableLibrary | LibraryEntry)[]} = Object.create(null)
    private static activeLibrarySetDisposer: () => void | null
}
