import * as Delir from '@ragg/delir-core'
import deream, { RenderingProgress } from '@ragg/deream'
import { listen, Store } from '@ragg/fleur'
import { remote } from 'electron'
import { dirname } from 'path'

import { EditorActions } from '../Editor/actions'
import { RendererActions } from './actions'

import * as Platform from '../../utils/platform'

interface State {
    project: Delir.Entity.Project | null
    composition: Delir.Entity.Composition | null
    progress: string | null
    previewRenderState: RenderState | null
    isInRendering: boolean
    exportRenderState: RenderingProgress | null
    exception: Delir.Exceptions.UserCodeException | null
}

export interface RenderState {
    currentFrame: number
}

const AUDIO_BUFFER_SIZE_SECONDS = 1

export default class RendererStore extends Store<State> {
    public static storeName = 'RendererStore'

    protected state: State = {
        project: null,
        composition: null,
        progress: null,
        previewRenderState: null,
        isInRendering: false,
        exportRenderState: null,
        exception: null,
    }

    private pipeline = new Delir.Engine.Engine()
    private pluginRegistry = this.pipeline.pluginRegistry

    private destCanvas: HTMLCanvasElement | null = null
    private destCanvasCtx: CanvasRenderingContext2D | null = null

    private audioContext: AudioContext | null = null
    private audioBuffer: AudioBuffer | null = null
    private audioBufferSource: AudioBufferSourceNode | null = null

    private handleSetActiveProject = listen(EditorActions.setActiveProjectAction, ({ project }) => {
        this.pipeline.setProject(project)
        this.updateWith(d => {
            ;((d.project as any) as Delir.Entity.Project | null) = project
        })
    })

    private handleChangeActiveComposition = listen(EditorActions.changeActiveCompositionAction, ({ compositionId }) => {
        const { project } = this.state
        if (!project) return

        this.updateWith(d => {
            ;((d.composition as any) as Delir.Entity.Composition | null) = project.findComposition(compositionId)
        })

        // renderer.stop()
    })

    private handleAddPlugins = listen(RendererActions.addPlugins, payload => {
        this.pluginRegistry.registerPlugin(payload.plugins)
    })

    private handleSetPreviewCanvas = listen(RendererActions.setPreviewCanvas, payload => {
        this.destCanvas = payload.canvas
        this.destCanvasCtx = this.destCanvas.getContext('2d')!
    })

    private handleStartPreveiew = listen(
        EditorActions.startPreviewAction,
        async ({ compositionId, beginFrame, ignoreMissingEffect }) => {
            if (!this.state.project || !this.state.composition || !this.destCanvas || !this.destCanvasCtx) return

            const { project } = this.state
            const targetComposition = project.findComposition(compositionId)
            if (!targetComposition) return

            this.audioBufferSource && this.audioBufferSource.stop()
            this.audioContext && (await this.audioContext.close())

            this.updateWith(s => (s.exception = null))

            this.audioContext = new AudioContext()

            this.audioBuffer = this.audioContext.createBuffer(
                targetComposition.audioChannels,
                /* length */ targetComposition.samplingRate * AUDIO_BUFFER_SIZE_SECONDS,
                /* sampleRate */ targetComposition.samplingRate,
            )

            let playbackRate: number = 1
            this.pipeline.setStreamObserver({
                onFrame: (canvas, status) => {
                    this.updateWith(
                        d =>
                            (d.previewRenderState = {
                                currentFrame: status.frame,
                            }),
                    )
                    this.destCanvasCtx!.drawImage(canvas, 0, 0)
                },
                onAudioBuffered: buffers => {
                    for (let idx = 0, l = buffers.length; idx < l; idx++) {
                        this.audioBuffer!.copyToChannel(buffers[idx], idx)
                    }

                    const audioBufferSource = this.audioContext!.createBufferSource()
                    audioBufferSource.buffer = this.audioBuffer
                    audioBufferSource.connect(this.audioContext!.destination)

                    this.audioBufferSource && this.audioBufferSource.stop()
                    this.audioBufferSource = audioBufferSource
                    audioBufferSource.playbackRate.value = playbackRate
                    audioBufferSource.start()
                    audioBufferSource.onended = () => {
                        audioBufferSource.disconnect(this.audioContext!.destination)
                    }
                },
            })

            const promise = this.pipeline.renderSequencial(targetComposition.id, {
                beginFrame: beginFrame,
                loop: true,
                ignoreMissingEffect: ignoreMissingEffect,
                realtime: true,
                audioBufferSizeSecond: AUDIO_BUFFER_SIZE_SECONDS,
            })

            promise.progress(progress => {
                playbackRate = Math.min(progress.playbackRate, 1)
                this.updateWith(d => (d.progress = `Preview: ${progress.state}`))
            })

            promise.catch(e => {
                if (e instanceof Delir.Exceptions.RenderingAbortedException) {
                    return
                } else if (e instanceof Delir.Exceptions.UserCodeException) {
                    this.updateWith(s => (s.exception = e))
                } else {
                    // tslint:disable-next-line:no-console
                    console.log(e)
                }
            })
        },
    )

    private handleStopPreview = listen(EditorActions.stopPreviewAction, () => {
        this.pipeline.stopCurrentRendering()
        this.audioBufferSource && this.audioBufferSource.stop()
    })

    private handleSeekPreviewFrame = listen(EditorActions.seekPreviewFrameAction, payload => {
        const { frame } = payload
        const targetComposition = this.state.composition!

        this.pipeline.setStreamObserver({
            onFrame: canvas => this.destCanvasCtx!.drawImage(canvas, 0, 0),
        })

        this.pipeline!.renderFrame(targetComposition.id, frame).catch(e => {
            // tslint:disable-next-line
            console.error(e)
        })
    })

    private handleRenderDestinate = listen(EditorActions.renderDestinateAction, async payload => {
        const appPath = dirname(remote.app.getPath('exe'))
        const ffmpegBin = __DEV__
            ? 'ffmpeg'
            : require('path').resolve(
                  appPath,
                  Platform.isMacOS() ? '../Resources/ffmpeg' : Platform.isLinux() ? 'ffmpeg' : './ffmpeg.exe',
              )

        // TODO: View側で聞いてくれ
        const file = remote.dialog.showSaveDialog({
            title: 'Destinate',
            buttonLabel: 'Render',
            filters: [
                {
                    name: 'mp4',
                    extensions: ['mp4'],
                },
            ],
        })

        if (!file) return
        if (!this.state.project || !this.state.composition || !this.pluginRegistry) return

        // deream() の前に一瞬待たないとフリーズしてしまうので
        // awaitを噛ませてステータスを確実に出す
        // await new Promise(resolve => {
        //     setImmediate(() => {
        //         EditorOps.autoSaveProject()
        //         EditorOps.updateProcessingState('Rendering: Initializing')
        //         resolve()
        //     })
        // })

        this.updateWith(d => (d.isInRendering = true))

        try {
            await deream({
                project: this.state.project,
                rootCompId: this.state.composition.id,
                exportPath: file,
                pluginRegistry: this.pluginRegistry,
                ignoreMissingEffect: payload.ignoreMissingEffect,
                temporaryDir: remote.app.getPath('temp'),
                ffmpegBin,
                onProgress: progress => {
                    setTimeout(() => {
                        this.updateWith(draft => (draft.exportRenderState = progress))
                    }, 0)
                },
            })
        } catch (e) {
            throw e
        } finally {
            this.updateWith(d => (d.isInRendering = false))
        }
    })

    public getPostEffectPlugins() {
        return this.pluginRegistry.getPostEffectPlugins()
    }

    public getPostEffectParametersById(pluginId: string) {
        return this.pluginRegistry.getPostEffectParametersById(pluginId)
    }

    public getLastRenderState() {
        return this.state.previewRenderState
    }

    public getExportingState() {
        return this.state.exportRenderState
    }

    public getUserCodeException() {
        return this.state.exception
    }

    public isInRendering() {
        return this.state.isInRendering
    }
}
