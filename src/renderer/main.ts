import * as React from 'react'
import * as ReactDOM from 'react-dom'

import AppComponent from './views/AppView'

import EditorStateActions from './actions/editor-state-actions'

import * as Delir from 'delir-core'

import RendererService from './services/renderer'
import BrowserProcessProxy from './services/browser-process-proxy'

window.addEventListener('DOMContentLoaded', async () => {
    // install devtools
    if (__DEV__) {
        const devtron = require('devtron')
        const {default: installExtension, REACT_DEVELOPER_TOOLS} = require('electron-devtools-installer')
        devtron.install()
        await installExtension(REACT_DEVELOPER_TOOLS)
    }

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
        const project = require('./devel/example-project/ExampleProject1').default
        EditorStateActions.setActiveProject(project);

        EditorStateActions.notify('It\'s experimental VFX Application works with JavaScript', '👐 <DEV MODE> Hello, welcome to Delir', 'info')
    }

    process.on('uncaughtException', (e: Error) => {
         EditorStateActions.notify(e.message, '😱Uncaught Exception😱', 'error', 5000, e.stack)
    })

    process.on('uncaughtRejection', (e: Error) => {
         EditorStateActions.notify(e.message, '😱Uncaught Rejection😱', 'error', 5000, e.stack)
    })

    RendererService.renderer.setDestinationCanvas(document.querySelector('canvas'))
    // RendererService.renderer.setDestinationAudioNode(audioContext.destination)
});
