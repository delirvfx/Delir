import * as Delir from '@ragg/delir-core'
import Fleur, { withReduxDevTools } from '@ragg/fleur'
import { createElementWithContext } from '@ragg/fleur-react'
import * as os from 'os'
import * as ReactDOM from 'react-dom'

import * as EditorOps from './domain/Editor/operations'
import * as PreferenceOps from './domain/Preference/operations'
import * as RendererOps from './domain/Renderer/operations'

import './assets/styles/font-awesome.min.css'
import './assets/styles/style.styl'

import AppView from './views/AppView'

import EditorStore from './domain/Editor/EditorStore'
import HistoryStore from './domain/History/HistoryStore'
import PreferenceStore from './domain/Preference/PreferenceStore'
import ProjectStore from './domain/Project/ProjectStore'
import RendererStore from './domain/Renderer/RendererStore'

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
        case 'Windows_NT':
            document.body.classList.add('platform-win')
            break
        case 'Darwin':
            document.body.classList.add('platform-mac')
            break
        case 'Linux':
            document.body.classList.add('platform-linux')
            break
    }

    const app = new Fleur({
        stores: [EditorStore, ProjectStore, RendererStore, PreferenceStore, HistoryStore],
    })
    const context = (window.delir = withReduxDevTools(app.createContext(), {
        enableTimeTravel: false,
    }))

    ReactDOM.render(createElementWithContext(context, AppView, {}), document.querySelector('#root'), () => {
        ;(document.querySelector('#loading') as HTMLElement).style.display = 'none'
    })

    await context.executeOperation(RendererOps.loadPlugins, {})
    await context.executeOperation(PreferenceOps.restoreApplicationPreference, {})
    await context.executeOperation(EditorOps.setActiveProject, {
        project: new Delir.Entity.Project({}),
    })

    if (__DEV__) {
        const project = require('./utils/Dev/ExampleProject1').default

        await context.executeOperation(EditorOps.setActiveProject, { project })
        await context.executeOperation(EditorOps.changeActiveComposition, {
            compositionId: project.compositions[0].id,
        })
    }
})
