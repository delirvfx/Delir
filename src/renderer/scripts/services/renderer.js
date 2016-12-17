import _ from 'lodash'
import {remote} from 'electron'
import electron from 'electron'
import {join} from 'path'
import Delir, {ProjectHelper} from 'delir-core'

import dispatcher from '../dispatcher'
import ActionTypes from '../action-types'
import EditorStateActions from '../actions/editor-state-actions'

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

        const targetComposition = ProjectHelper.findCompositionById(state.project, compositionId)

        if (! targetComposition) return
        if (! renderer) return
        if (renderer.isPlaying) {
            renderer.pause()
            return
        }

        audioBuffer = audioContext.createBuffer(
            targetComposition.audioChannels,
            /* length */targetComposition.samplingRate,
            /* sampleRate */targetComposition.samplingRate,
        )
        audioBufferSource = audioContext.createBufferSource()
        audioBufferSource.buffer = audioBuffer
        audioBufferSource.connect(audioContext.destination)
        audioBufferSource.start(0)

        renderer.setDestinationAudioBuffer(_.times(targetComposition.audioChannels, idx => audioBuffer.getChannelData(idx)))

        console.log('begin render');
        let promise = renderer.render({
            beginFrame: 0,
            targetCompositionId: compositionId,
            throttle: true,
        })

        promise.progress(progress => {
            EditorStateActions.updateProcessingState(`Preview: ${progress.state}`)

            if (progress.isAudioBuffered) {
                audioBufferSource.stop()
                audioBufferSource.disconnect(audioContext.destination)

                audioBufferSource = audioContext.createBufferSource()
                audioBufferSource.buffer = audioBuffer
                audioBufferSource.connect(audioContext.destination)
                audioBufferSource.start(0)
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

        setTimeout(() => EditorStateActions.updateProcessingState(`Rendering: Initializing`), 0)

        const activeComp = ProjectHelper.findCompositionById(state.project, compositionId)
        if (! activeComp) {
            setTimeout(() => EditorStateActions.updateProcessingState(`Rendering: Composition not selected`), 0)
        } else {
            renderer.export({
                exportPath: file,
                tmpDir: remote.app.getPath('temp'),
                targetCompositionId: activeComp.id,
            })
            .progress(progress => {
                if (progress.isRendering) {
                    EditorStateActions.updateProcessingState(`Rendering: ${Math.floor(progress.finished * 100)}% ${progress.state}`)
                } else {
                    EditorStateActions.updateProcessingState(`Rendering: ${progress.state}`)
                }
            })
            .catch(e => console.error(e.stack))
        }
    }
}

export default {
    initialize: async () => {
        audioContext = new AudioContext
        // scriptProcessor

        const userDir = remote.app.getPath('appData')
        pluginRegistry = new Delir.Services.PluginRegistry()

        const loaded = [
            // await pluginRegistry.loadPackageDir(join(process.cwd(), 'src/delir-core/src/plugins')),
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
