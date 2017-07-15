import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as os from 'os'

import AppComponent from './views/AppView'
import Monaco from './utils/Monaco'

import AppActions from './actions/App'

import * as Delir from 'delir-core'

import RendererService from './services/renderer'

window.addEventListener('DOMContentLoaded', async () => {
    // initialize app
    await RendererService.initialize()
    AppActions.setActiveProject(new Delir.Project.Project())
    await Monaco.setup()

    // Attach platform class to body element
    switch (os.type()) {
        case 'Windows_NT': document.body.classList.add('platform-win'); break;
        case 'Darwin': document.body.classList.add('platform-mac'); break;
        case 'Linux': document.body.classList.add('platform-linux'); break;
    }

    ReactDOM.unstable_deferredUpdates(() => {
        ReactDOM.render(
            React.createElement(AppComponent as any, {}, []),
            document.querySelector('#root')
        )
    })

    ;(document.querySelector('#loading') as HTMLElement).style.display = 'none'

    if (__DEV__) {
        require('./utils/Dev/example-project/ExampleProject1')
        AppActions.notify('It\'s experimental VFX Application works with JavaScript', '👐 <DEV MODE> Hello, welcome to Delir', 'info')
    }

    process.on('uncaughtException', (e: Error) => {
        console.error(e)
         AppActions.notify(e.message, '😱Uncaught Exception😱', 'error', 5000, e.stack)
    })

    process.on('uncaughtRejection', (e: Error) => {
        console.error(e)
         AppActions.notify(e.message, '😱Uncaught Rejection😱', 'error', 5000, e.stack)
    })

    // RendererService.renderer.setDestinationAudioNode(audioContext.destination)
});

window.delir = Delir
