import * as Delir from '@ragg/delir-core'
import { ProjectHelper } from '@ragg/delir-core'
import { listen, Store } from '@ragg/fleur'
import { remote } from 'electron'
import { dirname, join } from 'path'
import deream from '../../deream'

import { AppActions, RendererActions } from '../actions/actions'
import * as Platform from '../utils/platform'

interface State {
    project: Delir.Entity.Project | null
    composition: Delir.Entity.Composition | null
    progress: string | null
    renderState: RenderState | null
    isInRendering: boolean
}

export interface RenderState {
    currentFrame: number
}

export default class RendererStore extends Store<State> {
    public static storeName = 'RendererStore'

    protected state: State = {
        project: null,
        composition: null,
        progress: null,
        renderState: null,
        isInRendering: false,
    }

    private pipeline = new Delir.Engine.Engine()
    private pluginRegistry = this.pipeline.pluginRegistry

    private destCanvas: HTMLCanvasElement | null = null
    private destCanvasCtx: CanvasRenderingContext2D | null = null

    private audioContext: AudioContext | null = null
    private audioBuffer: AudioBuffer | null = null

    // @ts-ignore: unused private but listener
    private handleSetActiveProject = listen(AppActions.setActiveProjectAction, (payload) => {
        this.pipeline.project = payload.project
        this.updateWith(d => { d.project = payload.project })
    })

    // @ts-ignore: unused private but listener
    private handleChangeActiveComposition = listen(AppActions.changeActiveCompositionAction, (payload) => {
        if (!this.state.project) return

        this.updateWith(d => {
            d.composition = ProjectHelper.findCompositionById(this.state.project!, payload.compositionId)
        })

        // renderer.stop()
    })

    // @ts-ignore: unused private but listener
    private handleAddPlugins = listen(RendererActions.addPlugins, (payload) => {
        this.pluginRegistry.addEntries(payload.plugins)
    })

    // @ts-ignore: unused private but listener
    private handleSetPreviewCanvas = listen(RendererActions.setPreviewCanvas, (payload) => {
        this.destCanvas = payload.canvas
        this.destCanvasCtx = this.destCanvas.getContext('2d')!
    })

    // @ts-ignore: unused private but listener
    private handleStartPreveiew = listen(AppActions.startPreviewAction, (payload) => {
        if (!this.state.project || !this.state.composition || !this.destCanvas || !this.destCanvasCtx) return

        const {project} = this.state
        const targetComposition = ProjectHelper.findCompositionById(project, payload.compositionId)
        if (!targetComposition) return

        if (this.audioContext) {
            this.audioContext.close()
        }

        this.audioContext = new AudioContext()

        this.audioBuffer = this.audioContext.createBuffer(
            targetComposition.audioChannels,
            /* length */targetComposition.samplingRate,
            /* sampleRate */targetComposition.samplingRate,
        )

        this.pipeline.setStreamObserver({
            onFrame: (canvas, status) => {
                this.updateWith(d => d.renderState = {currentFrame: status.frame})
                this.destCanvasCtx!.drawImage(canvas, 0, 0)
            },
            onAudioBuffered: buffers => {
                for (let idx = 0, l = buffers.length; idx < l; idx++) {
                    this.audioBuffer!.copyToChannel(buffers[idx], idx)
                }

                const audioBufferSource = this.audioContext!.createBufferSource()
                audioBufferSource.buffer = this.audioBuffer
                audioBufferSource.connect(this.audioContext!.destination)

                audioBufferSource.start(0, 0, 1)
                audioBufferSource.stop(this.audioContext!.currentTime + 1)
                audioBufferSource.onended = () => {
                    audioBufferSource.disconnect(this.audioContext!.destination)
                }
            },
        })

        const promise = this.pipeline.renderSequencial(targetComposition.id, {
            beginFrame: payload.beginFrame,
            loop: true,
        })

        promise.progress(progress => {
            this.updateWith(d => d.progress = `Preview: ${progress.state}`)
        })

        promise.catch(e => {
            if (e instanceof Delir.Exceptions.RenderingAbortedException) {
                // AppActions.updateProcessingState('Stop.')
                return
            }

            console.error(e)
        })
    })

    // @ts-ignore: unused private but listener
    private handleStopPreview = listen(AppActions.stopPreviewAction, () => {
        this.pipeline.stopCurrentRendering()
    })

    // @ts-ignore: unused private but listener
    private handleSeekPreviewFrame = listen(AppActions.seekPreviewFrameAction, (payload) => {
        const {frame} = payload
        const targetComposition = this.state.composition!

        this.pipeline.setStreamObserver({
            onFrame: canvas => this.destCanvasCtx!.drawImage(canvas, 0, 0)
        })

        this.pipeline!.renderFrame(targetComposition.id, frame).catch(e => console.error(e))
    })

    // @ts-ignore: unused private but listener
    private handleRenderDestinate = listen(AppActions.renderDestinateAction, async (payload) => {
        const appPath = dirname(remote.app.getPath('exe'))
        const ffmpegBin = __DEV__ ? 'ffmpeg' : require('path').resolve(
            appPath,
            Platform.isMacOS() ? '../Resources/ffmpeg' : './ffmpeg.exe'
        )

        // TODO: View側で聞いてくれ
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

        if (!file) return
        if (!this.state.project || !this.state.composition || !this.pluginRegistry) return

        // deream() の前に一瞬待たないとフリーズしてしまうので
        // awaitを噛ませてステータスを確実に出す
        // await new Promise(resolve => {
        //     setImmediate(() => {
        //         AppActions.autoSaveProject()
        //         AppActions.updateProcessingState('Rendering: Initializing')
        //         resolve()
        //     })
        // })

        this.updateWith(d => d.isInRendering = true)

        try {
            await deream({
                project: this.state.project,
                rootCompId: this.state.composition.id,
                exportPath: file,
                pluginRegistry: this.pluginRegistry,
                temporaryDir: remote.app.getPath('temp'),
                ffmpegBin,
                onProgress: progress => {
                    setTimeout(() => {
                        // AppActions.updateProcessingState(progress.state)
                    }, 0)
                }
            })
        } catch (e) {
            throw e
        } finally {
            this.updateWith(d => d.isInRendering = false)
        }
    })

    public getPostEffectPlugins() {
        return this.pluginRegistry.getPostEffectPlugins()
    }

    public getPostEffectParametersById(pluginId: string) {
        return this.pluginRegistry.getPostEffectParametersById(pluginId)
    }

    public getLastRenderState() {
        return this.state.renderState
    }

    public isInRendering() {
        return this.state.isInRendering
    }
}
