import Fleur from '@ragg/fleur'
import { createElementWithContext } from '@ragg/fleur-react'
import * as Delir from 'delir-core'
import * as os from 'os'
import * as ReactDOM from 'react-dom'

import * as AppActions from './actions/App'
import * as RendererOps from './actions/RendererOps'

import Monaco from './utils/Monaco'
import AppView from './views/AppView'

import EditorStateStore from './stores/EditorStateStore'
import ProjectStore from './stores/ProjectStore'
import RendererStore from './stores/RendererStore'

// Handle errors
// process.on('uncaughtException', (e: Error) => {
//     // tslint:disable-next-line: no-console
//     console.error(e)
// })

// process.on('uncaughtRejection', (e: Error) => {
//     // tslint:disable-next-line: no-console
//     console.error(e)
// })

window.addEventListener('DOMContentLoaded', async () => {
    // initialize app
    await Monaco.setup()

    // Attach platform class to body element
    switch (os.type()) {
        case 'Windows_NT': document.body.classList.add('platform-win'); break
        case 'Darwin': document.body.classList.add('platform-mac'); break
        case 'Linux': document.body.classList.add('platform-linux'); break
    }

    const app = new Fleur({ stores: [ EditorStateStore, ProjectStore, RendererStore] })
    const context = window.delir = app.createContext()

    // console.log(createElementWithContext)
    // ReactDOM.unstable_deferredUpdates(() => {
    ReactDOM.render(
        createElementWithContext(context, AppView, {}),
        document.querySelector('#root'),
        () => {
            (document.querySelector('#loading') as HTMLElement).style.display = 'none'
        }
    )
    // })

    await context.executeOperation(RendererOps.loadPlugins, {})
    await context.executeOperation(AppActions.setActiveProject, { project: new Delir.Project.Project() })

    if (__DEV__) {
        const project = require('./utils/Dev/ExampleProject1').default

        await context.executeOperation(AppActions.setActiveProject, { project })
        await context.executeOperation(AppActions.changeActiveComposition, { compositionId: project.compositions[0].id })

        context.executeOperation(AppActions.notify, {
            message: 'It\'s experimental VFX Application works with JavaScript',
            title: '👐 <DEV MODE> Hello, welcome to Delir',
            level: 'info',
        })
    }
})
