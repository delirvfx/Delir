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
    })
}

// Load monaco-editor
const script = document.createElement('script')
script.src = baseDir + '/loader.js'
script.async = false
script.onload = loaderLoadedHandler
document.head.appendChild(script)
