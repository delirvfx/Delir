import _ from 'lodash'
import {remote} from 'electron'
import electron from 'electron'
import {join} from 'path'
import Delir from 'delir-core'
const {Helper: DelirHelper} = Delir

import dispatcher from '../dispatcher'
import ActionTypes from '../action-types'

let pluginRegistry, renderer, audioContext, audioBuffer, audioBufferSource

let state = {
    project: null,
}

const handlers = {
    [ActionTypes.SET_ACTIVE_PROJECT]({project})
    {
        renderer.setProject(project)
        state = Object.assign({}, state, {project})
    },

    [ActionTypes.TOGGLE_PREVIEW]({compositionId})
    {
        if (! state.project) return

        if (renderer.isPlaying()) {
            renderer.stop()
            return
        }

        const targetComposition = DelirHelper.findCompositionById(state.project, compositionId)

        if (! targetComposition) return
        if (! renderer) return

        audioBuffer = audioContext.createBuffer(
            targetComposition.audioChannels,
            Delir.Renderer.AUDIO_BUFFER_SIZE,
            targetComposition.samplingRate,
        )
        audioBufferSource = audioContext.createBufferSource()
        audioBufferSource.buffer = audioBuffer
        audioBufferSource.loop = true
        audioBufferSource.connect(audioContext.destination)
        audioBufferSource.start()

        renderer.setDestinationAudioBuffer(_.times(targetComposition.audioChannels, idx => audioBuffer.getChannelData(idx)))

        let promise = renderer.render({
            beginFrame: 0,
            targetCompositionId: compositionId,
        })

        promise.progress(progress => {
            if (progress.isRendering) {

            }

            if (progress.isCompleted) {
                audioBufferSource.stop()
                audioBufferSource.disconnect(audioContext.destination)
                audioBufferSource = null
                audioBuffer = null
            }
        })

        promise.catch(e => console.error(e.stack))
    },

    [ActionTypes.RENDER_DESTINATE]({compositionId})
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

        const activeComp = DelirHelper.findCompositionById(state.project, compositionId)
        if (activeComp) {
            renderer.export({
                exportPath: file,
                targetCompositionId: activeComp.id,
            }) // .catch(e => console.error(e.stack))
        }
    }
}

export default {
    initialize: async () => {
        audioContext = new AudioContext
        // scriptProcessor

        const userDir = remote.app.getPath('appData')
        pluginRegistry = new Delir.Services.PluginRegistory()

        const loaded = [
            await pluginRegistry.loadPackageDir(join(process.cwd(), 'src/delir-core/src/plugins')),
            await pluginRegistry.loadPackageDir(join(userDir, '/delir/plugins')),
        ]

        console.log('Plugin loaded', loaded);
        renderer = new Delir.Renderer({
            pluginRegistry: pluginRegistry,
        })

        renderer.setAudioContext(audioContext)

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
