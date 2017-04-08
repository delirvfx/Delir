import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as os from 'os'

import AppComponent from './views/AppView'

import EditorStateActions from './actions/editor-state-actions'

import * as Delir from 'delir-core'

import RendererService from './services/renderer'

window.addEventListener('DOMContentLoaded', async () => {
    // install devtools
    if (__DEV__) {
        const devtron = require('devtron')
        const {default: installExtension, REACT_DEVELOPER_TOOLS} = require('electron-devtools-installer')
        devtron.install()
        await installExtension(REACT_DEVELOPER_TOOLS)
    }

    // initialize app
    await RendererService.initialize()
    EditorStateActions.setActiveProject(new Delir.Project.Project())

    // Attach platform class to body element
    switch (os.type()) {
        case 'Windows_NT': document.body.classList.add('platform-win'); break;
        case 'Darwin': document.body.classList.add('platform-mac'); break;
        case 'Linux': document.body.classList.add('platform-linux'); break;
    }

    ReactDOM.render(
        React.createElement(AppComponent as any, {}, []),
        document.querySelector('#root')
    )

    ;(document.querySelector('#loading') as HTMLElement).style.display = 'none'

    if (__DEV__) {
        require('./devel/example-project/ExampleProject1')
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
