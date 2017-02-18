import * as React from 'react'
import * as ReactDOM from 'react-dom'

import * as devtron from 'devtron'
import installExtension, {REACT_DEVELOPER_TOOLS} from 'electron-devtools-installer'

import AppComponent from './views/AppView'

import EditorStateActions from './actions/editor-state-actions'

import * as Delir from 'delir-core'

import RendererService from './services/renderer'
import BrowserProcessProxy from './services/browser-process-proxy'

if (typeof global !== 'undefined') {
    (global as any).require('babel-register')
}

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

window.addEventListener('DOMContentLoaded', async () => {
    // install devtools
    devtron.install()
    await installExtension(REACT_DEVELOPER_TOOLS)

    // initialize app
    BrowserProcessProxy.initialize()
    await RendererService.initialize()

    // const file = remote.dialog.showOpenDialog({
    //     title: 'Save as ...',
    //     defaultPath: '/Users/ragg/',
    //     buttonLabel: 'Save',
    //     filters: [
    //         {
    //             name: 'Delir Project File',
    //             extensions: ['delir']
    //         }
    //     ],
    //     properties: ['openFile']
    // })[0]
    //
    // console.log(file);
    //
    // const p = app.project = Delir.Project.Project.deserialize(fs.readFileSync(file))

    ReactDOM.render(
        React.createElement(AppComponent as any, {}, []),
        document.querySelector('#root')
    )

    ;(document.querySelector('#loading') as HTMLElement).style.display = 'none'

    if (__DEV__) {
        const p = require('./devel/example-project/ExampleProject1').default
        EditorStateActions.setActiveProject(p)

        EditorStateActions.notify('It\'s experimental VFX Application works with JavaScript', 'Hello, welcome to Delir', 'info')
    }

    process.on('uncaughtException', (e: Error) => {
         EditorStateActions.notify(e.message, '😱Uncaught Exception😱', 'error', void 0, e.stack)
    })

    process.on('uncaughtRejection', (e: Error) => {
         EditorStateActions.notify(e.message, '😱Uncaught Rejection😱', 'error', void 0, e.stack)
    })

    RendererService.renderer.setDestinationCanvas(document.querySelector('canvas'))
    // RendererService.renderer.setDestinationAudioNode(audioContext.destination)
});
