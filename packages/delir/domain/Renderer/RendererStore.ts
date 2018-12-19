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
        previewRenderState: null,
        isInRendering: false,
        exportRenderState: null,
    }

    private pipeline = new Delir.Engine.Engine()
    private pluginRegistry = this.pipeline.pluginRegistry

    private destCanvas: HTMLCanvasElement | null = null
    private destCanvasCtx: CanvasRenderingContext2D | null = null

    private audioContext: AudioContext | null = null
    private audioBuffer: AudioBuffer | null = null

    private handleSetActiveProject = listen(EditorActions.setActiveProjectAction, ({ project }) => {
        this.pipeline.setProject(project)
        this.updateWith(d => {
            ((d.project as any) as Delir.Entity.Project | null) = project
        })
    })

    private handleChangeActiveComposition = listen(EditorActions.changeActiveCompositionAction, ({ compositionId }) => {
        const { project } = this.state
        if (!project) return

        this.updateWith(d => {
            ((d.composition as any) as Delir.Entity.Composition | null) = project.findComposition(compositionId)
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
        ({ compositionId, beginFrame, ignoreMissingEffect }) => {
            if (!this.state.project || !this.state.composition || !this.destCanvas || !this.destCanvasCtx) return

            const { project } = this.state
            const targetComposition = project.findComposition(compositionId)
            if (!targetComposition) return

            if (this.audioContext) {
                this.audioContext.close()
            }

            this.audioContext = new AudioContext()

            this.audioBuffer = this.audioContext.createBuffer(
                targetComposition.audioChannels,
                /* length */ targetComposition.samplingRate,
                /* sampleRate */ targetComposition.samplingRate,
            )

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

                    audioBufferSource.start(0, 0, 1)
                    audioBufferSource.stop(this.audioContext!.currentTime + 1)
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
            })

            promise.progress(progress => {
                this.updateWith(d => (d.progress = `Preview: ${progress.state}`))
            })

            promise.catch(e => {
                if (e instanceof Delir.Exceptions.RenderingAbortedException) {
                    // EditorOps.updateProcessingState('Stop.')
                    return
                }
            })
        },
    )

    private handleStopPreview = listen(EditorActions.stopPreviewAction, () => {
        this.pipeline.stopCurrentRendering()
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
            : require('path').resolve(appPath, Platform.isMacOS() ? '../Resources/ffmpeg' : './ffmpeg.exe')

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

    public isInRendering() {
        return this.state.isInRendering
    }
}
