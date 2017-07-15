import * as _ from 'lodash'
import {remote} from 'electron'
import {join, dirname} from 'path'
import * as Delir from 'delir-core'
import {ProjectHelper} from 'delir-core'

import * as Platform from '../utils/platform'
import dispatcher from '../dispatcher'
import {KnownPayload} from '../actions/PayloadTypes'

import EditorStateStore from '../stores/EditorStateStore'
import AppActions from '../actions/App'
import {DispatchTypes as EditorStateDispatchTypes} from '../actions/App'

let pluginRegistry: Delir.PluginRegistry|null = null
let pluginLoader: Delir.Services.PluginLoader|null = null
// let renderer: Delir.Renderer.Renderer|null = null
let pipeline: Delir.Renderer.Pipeline|null = null
let audioContext: AudioContext|null = null
let audioBuffer: AudioBuffer|null = null
let audioBufferSource: AudioBufferSourceNode|null = null

let state: {
    project: Delir.Project.Project|null,
    composition: Delir.Project.Composition|null,
} = {
    project: null,
    composition: null,
}

const handlePayload = (payload: KnownPayload) => {
    switch (payload.type) {
        case EditorStateDispatchTypes.SetActiveProject:
            // renderer.setProject(payload.entity.project)
            pipeline!.project = payload.entity.project
            state.project = payload.entity.project
            break

        case EditorStateDispatchTypes.ChangeActiveComposition: {
            if (!state.project) break
            state.composition = ProjectHelper.findCompositionById(state.project, payload.entity.compositionId)
            // renderer.stop()
            break
        }

        case EditorStateDispatchTypes.StartPreview: {
            if (!state.project || !state.composition) break
            if (!pipeline || !audioContext) break

            const targetComposition = ProjectHelper.findCompositionById(state.project, payload.entity.compositionId)
            if (! targetComposition) break

            // if (renderer.isPlaying) {
            //     renderer.pause()
            //     break
            // }

            audioBuffer = audioContext.createBuffer(
                targetComposition.audioChannels,
                /* length */targetComposition.samplingRate,
                /* sampleRate */targetComposition.samplingRate,
            )
            audioBufferSource = audioContext.createBufferSource()
            audioBufferSource.buffer = audioBuffer
            audioBufferSource.connect(audioContext.destination)
            audioBufferSource.start(0)

            // renderer.setDestinationAudioBuffer(_.times(targetComposition.audioChannels, idx => audioBuffer!.getChannelData(idx)))
            pipeline.destinationAudioNode = audioContext.destination

            // let promise = pipeline.renderFrame({
            //     beginFrame: 0,
            //     targetCompositionId: state.composition.id,
            //     throttle: true,
            // })

            const promise = pipeline.renderSequencial(targetComposition.id, {
                beginFrame: payload.entity.beginFrame,
                loop: true,
            })

            promise.progress(progress => {
                AppActions.updateProcessingState(`Preview: ${progress.state}`)

                if (!audioBufferSource) return

                if (progress.isAudioBuffered) {
                    audioBufferSource.stop()
                    audioBufferSource.disconnect(audioContext!.destination)

                    audioBufferSource = audioContext!.createBufferSource()
                    audioBufferSource.buffer = audioBuffer
                    audioBufferSource.connect(audioContext!.destination)
                    audioBufferSource.start(0)
                }

                if (progress.isCompleted) {
                    audioBufferSource.stop()
                    audioBufferSource.disconnect(audioContext!.destination)
                    audioBufferSource = null
                    audioBuffer = null
                }
            })

            promise.catch(e => {
                if (e instanceof Delir.Exceptions.RenderingAbortedException) {
                    AppActions.updateProcessingState(`Stop.`)
                    return
                }
                console.error(e)
            })

            break
        }

        case EditorStateDispatchTypes.StopPreview: {
            if (pipeline) {
                pipeline.stopCurrentRendering()
            }
        }

        case EditorStateDispatchTypes.SeekPreviewFrame: {
            const {frame} = payload.entity
            const targetComposition = state.composition!

            // if (!renderer || !audioContext) return
            // たぶんプレビュー中
            // TODO: Seek in preview
            // if (renderer.isPlaying) return

            // audioBuffer = audioContext.createBuffer(
            //     targetComposition.audioChannels,
            //     /* length */targetComposition.samplingRate,
            //     /* sampleRate */targetComposition.samplingRate,
            // )
            // audioBufferSource = audioContext.createBufferSource()
            // audioBufferSource.buffer = audioBuffer
            // audioBufferSource.connect(audioContext.destination)
            // audioBufferSource.start(0)

            // renderer.setDestinationAudioBuffer(_.times(targetComposition.audioChannels, idx => audioBuffer!.getChannelData(idx)))

            // renderer!.render({
            //     beginFrame: frame,
            //     endFrame: frame,
            //     targetCompositionId: state.composition!.id!,
            // })
            // .catch((e: Error) => console.error(e.stack))
            pipeline!.renderFrame(targetComposition.id, frame)
            .catch(e => console.error(e))


            break
        }

        case EditorStateDispatchTypes.RenderDestinate: (() => {
            const appPath = dirname(remote.app.getPath('exe'))
            const ffmpegBin = __DEV__ ? 'ffmpeg' : require('path').resolve(
                appPath,
                Platform.isMacOS() ? '../Resources/ffmpeg' : './ffmpeg.exe'
            )

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

            setTimeout(() => AppActions.updateProcessingState(`Rendering: Initializing`), 0)

            const activeComp = ProjectHelper.findCompositionById(state.project, payload.entity.compositionId)
            if (! activeComp) {
                setTimeout(() => AppActions.updateProcessingState(`Rendering: Composition not selected`), 0)
            } else {
                renderer.export({
                    exportPath: file,
                    tmpDir: remote.app.getPath('temp'),
                    targetCompositionId: activeComp.id,
                    ffmpegBin
                })
                .progress(progress => {
                    if (progress.isRendering) {
                        AppActions.updateProcessingState(`Rendering: ${Math.floor(progress.finished * 100)}% ${progress.state}`)
                    } else {
                        AppActions.updateProcessingState(`Rendering: ${progress.state}`)
                    }
                })
                .catch(e => console.error(e.stack))
            }
            })()
            break
    }
}

const rendererService = {
    initialize: async () => {
        audioContext = new AudioContext
        // scriptProcessor

        const userDir = remote.app.getPath('appData')
        pluginLoader = new Delir.Services.PluginLoader()
        pluginRegistry = new Delir.PluginRegistry()

        const loaded = [
            await pluginLoader.loadPackageDir(join(remote.app.getAppPath(), '/plugins')),
            await pluginLoader.loadPackageDir(join(userDir, '/delir/plugins')),
        ]

        const successes = [].concat(...loaded.map<any>(({loaded}) => loaded))
        const fails = [].concat(...loaded.map<any>(({failed}) => failed))

        if (fails.length > 0) {
            const failedPlugins = fails.map((fail: any) => fail.package).join(', ')
            const message = fails.map((fail: any) => fail.reason).join('\n\n')
            AppActions.notify(`${failedPlugins}`, `Failed to load ${fails.length} plugins`, 'error', 5000, message)
        }

        console.log('Plugin loaded', successes, 'Failed:', fails)
        loaded.forEach(({loaded}) => pluginRegistry!.addEntries(loaded))

        // renderer = new Delir.Renderer.Renderer({
        //     pluginRegistry: pluginRegistry,
        // })

        // renderer.setAudioContext(audioContext)

        pipeline = new Delir.Renderer.Pipeline()
        pipeline.pluginRegistry = pluginRegistry

        dispatcher.register(handlePayload)
    },

    get pluginRegistry() {
        return pluginRegistry
    },

    get renderer(): Delir.Renderer.Pipeline {
        return pipeline
        return renderer
    }
}
window.app.renderer = rendererService
export default rendererService
