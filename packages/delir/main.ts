import * as Delir from '@ragg/delir-core'
import Fleur from '@ragg/fleur'
import { createElementWithContext } from '@ragg/fleur-react'
import * as os from 'os'
import * as ReactDOM from 'react-dom'

import * as RendererOps from './actions/RendererOps'
import * as EditorOps from './domain/Editor/operations'
import * as PreferenceOps from './domain/Preference/operations'

import AppView from './views/AppView'

import PreferenceStore from '@ragg/delir/domain/Preference/PreferenceStore'
import EditorStore from './domain/Editor/EditorStore'
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
    // Attach platform class to body element
    switch (os.type()) {
        case 'Windows_NT': document.body.classList.add('platform-win'); break
        case 'Darwin': document.body.classList.add('platform-mac'); break
        case 'Linux': document.body.classList.add('platform-linux'); break
    }

    const app = new Fleur({ stores: [ EditorStore, ProjectStore, RendererStore, PreferenceStore ] })
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
    await context.executeOperation(PreferenceOps.restoreApplicationPreference, {})
    await context.executeOperation(EditorOps.setActiveProject, { project: new Delir.Entity.Project() })

    if (__DEV__) {
        const project = require('./utils/Dev/ExampleProject1').default

        await context.executeOperation(EditorOps.setActiveProject, { project })
        await context.executeOperation(EditorOps.changeActiveComposition, { compositionId: project.compositions[0].id })
    }
})
