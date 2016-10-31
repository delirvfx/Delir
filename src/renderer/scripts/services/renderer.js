import {remote} from 'electron'
import electron from 'electron'
import {join} from 'path'
import Delir from 'delir-core'
const {Helper: DelirHelper} = Delir

import dispatcher from '../dispatcher'
import ActionTypes from '../action-types'

let pluginRegistry, renderer

let state = {
    project: null,
}

const handlers = {
    [ActionTypes.SET_ACTIVE_PROJECT]({project})
    {
        state = Object.assign({project})
        renderer.setProject(project)
    },

    [ActionTypes.TOGGLE_PREVIEW]({compositionId})
    {
        if (! state.project) return
        if (renderer.isPlaying()) {
            renderer.stop()
        }

        const targetComposition = DelirHelper.findCompositionById(state.project, compositionId)

        if (! targetComposition) return
        if (! renderer) return

        let promise = renderer.render({
            beginFrame: 0,
            targetCompositionId: compositionId,
        }).catch(e => console.error(e.stack))
    },

    [ActionTypes.DESTINATE_PROJECT]({compositionId})
    {
        const file = remote.dialog.showSaveDialog(({
            title: 'Destinate',
            buttonLabel: 'Render',
            filters: [
                {
                    name: 'mp4',
                    extensions: ['mp4']
                }
            ],
        }))

        if (! file) return

        const activeComp = ProjectStore.getState().activeComp
        if (activeComp) {
            renderer.export({
                exportPath: file,
                targetCompositionId: activeComp.id,
            }); // .catch(e => console.error(e.stack))
        }
    }
}

export default {
    initialize: async () => {
        const userDir = remote.app.getPath('appData')

        pluginRegistry = new Delir.Services.PluginRegistory()

        const loaded = [
            await pluginRegistry.loadPackageDir(join(process.cwd(), 'src/delir-core/src/plugins')),
            await pluginRegistry.loadPackageDir(join(userDir, '/delir/plugins')),
        ]

        console.log('Plugin loaded', loaded);
        renderer = new Delir.SessionRenderer({
            pluginRegistory: pluginRegistry,
        })

        dispatcher.register(action => {
            if (handlers[action.type]) {
                handlers[action.type](action.payload)
            }
        })
    },

    get pluginRegistry() {
        return pluginRegistry
    },

    get renderer() {
        return renderer
    }
}
