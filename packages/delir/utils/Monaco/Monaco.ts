import * as Delir from '@ragg/delir-core'
import * as monaco from 'monaco-editor'

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
    'lib.es5.d.ts': require('!raw-loader!typescript/lib/lib.es5.d.ts'),
    'lib.es2015.collection.d.ts': require('!raw-loader!typescript/lib/lib.es2015.collection.d.ts'),
    'lib.es2015.core.d.ts': require('!raw-loader!typescript/lib/lib.es2015.core.d.ts'),
    'lib.es2015.generator.d.ts': require('!raw-loader!typescript/lib/lib.es2015.generator.d.ts'),
    'lib.es2015.iterable.d.ts': require('!raw-loader!typescript/lib/lib.es2015.iterable.d.ts'),
    'lib.es2015.promise.d.ts': require('!raw-loader!typescript/lib/lib.es2015.promise.d.ts'),
    'lib.es2015.proxy.d.ts': require('!raw-loader!typescript/lib/lib.es2015.proxy.d.ts'),
    'lib.es2015.reflect.d.ts': require('!raw-loader!typescript/lib/lib.es2015.reflect.d.ts'),
    'lib.es2015.symbol.d.ts': require('!raw-loader!typescript/lib/lib.es2015.symbol.d.ts'),
    'lib.es2015.symbol.wellknown.d.ts': require('!raw-loader!typescript/lib/lib.es2015.symbol.wellknown.d.ts'),
    'lib.es2016.array.include.d.ts': require('!raw-loader!typescript/lib/lib.es2016.array.include.d.ts'),
    'console.d.ts': require('!raw-loader!./console.d.ts.txt'),
}

export default class Monaco {
    public static registerLibrarySet(name: string, libs: (AvailableLibrary | LibraryEntry)[]) {
        this.librarySet[name] = libs
    }

    public static activateLibrarySet(name: string) {
        if (Monaco.currentLibrarySet !== name && this.activeLibrarySetDisposer) {
            this.activeLibrarySetDisposer()
        }

        const disposables = this.librarySet[name].map(lib => {
            if (typeof lib === 'string') {
                return monaco.languages.typescript.javascriptDefaults.addExtraLib(typeDefinitionLibs[lib], lib)
            } else {
                return monaco.languages.typescript.javascriptDefaults.addExtraLib(lib.typedef, lib.name)
            }
        })

        Monaco.currentLibrarySet = name
        this.activeLibrarySetDisposer = () => disposables.forEach(d => d.dispose())
    }

    private static currentLibrarySet: string

    private static librarySet: {
        [setName: string]: (AvailableLibrary | LibraryEntry)[]
    } = {
        expressionEditor: [
            'lib.es5.d.ts',
            'lib.es2015.collection.d.ts',
            'lib.es2015.core.d.ts',
            'lib.es2015.generator.d.ts',
            'lib.es2015.iterable.d.ts',
            'lib.es2015.promise.d.ts',
            'lib.es2015.proxy.d.ts',
            'lib.es2015.reflect.d.ts',
            'lib.es2015.symbol.d.ts',
            'lib.es2015.symbol.wellknown.d.ts',
            'lib.es2016.array.include.d.ts',
            'console.d.ts',
            {
                name: 'ExpressionAPI.d.ts',
                typedef: Delir.Engine.expressionContextTypeDefinition,
            },
        ],
        scriptEditor: [],
    }

    private static activeLibrarySetDisposer: () => void | null
}
