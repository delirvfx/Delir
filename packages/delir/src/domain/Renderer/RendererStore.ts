import * as Delir from '@delirvfx/core'
import { listen, Store, StoreContext } from '@fleur/fleur'
import { RenderingProgress } from '@ragg/deream'

import { EditorActions } from '../Editor/actions'
import { RendererActions } from './actions'

interface State {
  project: Delir.Entity.Project | null
  composition: Delir.Entity.Composition | null
  progress: string | null
  previewPlaying: boolean
  previewRenderState: RenderState | null
  isInRendering: boolean
  framePreviewWaiting: boolean
  exportRenderState: RenderingProgress | null
  exception: Delir.Exceptions.UserCodeException | null
}

interface InternalState {
  audioVolume: number
}

export interface RenderState {
  currentFrame: number
}

const AUDIO_BUFFER_SIZE_SECONDS = 1

export default class RendererStore extends Store<State> {
  public get previewPlaying() {
    return this.state.previewPlaying
  }

  public get framePreviewWaiting() {
    return this.state.framePreviewWaiting
  }

  public static storeName = 'RendererStore'

  public state: State = {
    project: null,
    composition: null,
    progress: null,
    previewPlaying: false,
    previewRenderState: null,
    isInRendering: false,
    framePreviewWaiting: false,
    exportRenderState: null,
    exception: null,
  }

  public pluginRegistry: Delir.PluginRegistry
  public engine = new Delir.Engine.Engine()

  private destCanvas: HTMLCanvasElement | null = null
  private destCanvasCtx: CanvasRenderingContext2D | null = null

  private audioContext: AudioContext | null = null
  private gainNode: GainNode | null = null
  private audioBuffer: AudioBuffer | null = null
  private audioBufferSource: AudioBufferSourceNode | null = null

  private internalState: InternalState = {
    audioVolume: 100,
  }

  private handleSetActiveProject = listen(EditorActions.setActiveProject, ({ project }) => {
    this.engine.setProject(project)
    this.updateWith(d => {
      ;((d.project as any) as Delir.Entity.Project | null) = project
    })
  })

  private handleChangeActiveComposition = listen(EditorActions.changeActiveComposition, ({ compositionId }) => {
    const { project } = this.state
    if (!project) return

    this.updateWith(d => {
      ;((d.composition as any) as Delir.Entity.Composition | null) = project.findComposition(compositionId)
    })

    // renderer.stop()
  })

  private handleUnregisterPlugin = listen(RendererActions.unregisterPlugins, ({ id }) => {
    this.pluginRegistry.unregisterPlugin(id)
  })

  private handleAddPlugins = listen(RendererActions.registerPlugins, payload => {
    this.pluginRegistry.registerPlugin(payload.plugins)
  })

  private handleClearCache = listen(RendererActions.clearCache, () => {
    this.engine.clearCache()
  })

  private handleSetPreviewCanvas = listen(RendererActions.setPreviewCanvas, payload => {
    this.destCanvas = payload.canvas
    this.destCanvasCtx = this.destCanvas.getContext('2d')!
  })

  private handleSetAudioVolume = listen(RendererActions.setAudioVolume, ({ volume }) => {
    this.internalState = { ...this.internalState, audioVolume: volume }
    this.gainNode && (this.gainNode.gain.value = volume / 100)
  })

  private handleStartPreview = listen(
    RendererActions.startPreview,
    async ({ compositionId, beginFrame, ignoreMissingEffect }) => {
      if (!this.state.project || !this.state.composition || !this.destCanvas || !this.destCanvasCtx) return

      const { project } = this.state
      const targetComposition = project.findComposition(compositionId)
      if (!targetComposition) return

      this.audioBufferSource && this.audioBufferSource.stop()
      this.audioContext && (await this.audioContext.close())

      this.updateWith(s => {
        s.exception = null
        s.previewRenderState = null
        s.previewPlaying = true
      })

      this.audioContext = new AudioContext()
      this.gainNode = this.audioContext.createGain()
      this.gainNode.gain.value = this.internalState.audioVolume / 100
      this.gainNode.connect(this.audioContext.destination)

      this.audioBuffer = this.audioContext.createBuffer(
        targetComposition.audioChannels,
        /* length */ targetComposition.samplingRate * AUDIO_BUFFER_SIZE_SECONDS,
        /* sampleRate */ targetComposition.samplingRate,
      )

      let playbackRate: number = 1
      this.engine.setStreamObserver({
        onFrame: (canvas, status) => {
          this.updateWith(d => {
            d.previewRenderState = {
              currentFrame: status.frame,
            }
          })
          this.destCanvasCtx!.drawImage(canvas, 0, 0)
        },
        onAudioBuffered: buffers => {
          for (let idx = 0, l = buffers.length; idx < l; idx++) {
            this.audioBuffer!.copyToChannel(buffers[idx], idx)
          }

          const audioBufferSource = this.audioContext!.createBufferSource()
          audioBufferSource.buffer = this.audioBuffer
          audioBufferSource.connect(this.gainNode!)

          this.audioBufferSource && this.audioBufferSource.stop()
          this.audioBufferSource = audioBufferSource
          audioBufferSource.playbackRate.value = playbackRate
          audioBufferSource.start()
          audioBufferSource.onended = () => {
            audioBufferSource.disconnect(this.gainNode!)
          }
        },
      })

      const promise = this.engine.renderSequencial(targetComposition.id, {
        beginFrame: beginFrame,
        loop: true,
        ignoreMissingEffect: ignoreMissingEffect,
        realtime: true,
        audioBufferSizeSecond: AUDIO_BUFFER_SIZE_SECONDS,
      })

      promise.progress(progress => {
        playbackRate = Math.min(progress.playbackRate, 1)
        // this.updateWith(d => (d.progress = `Preview: ${progress.state}`))
      })

      promise.then(
        () => {
          this.updateWith(s => (s.previewPlaying = false))
        },
        e => {
          if (e instanceof Delir.Exceptions.RenderingAbortedException) {
          } else if (e instanceof Delir.Exceptions.UserCodeException) {
          } else {
            // tslint:disable-next-line:no-console
            console.log(e)
          }
          this.updateWith(s => {
            s.previewPlaying = false
            s.previewRenderState = null
          })
        },
      )
    },
  )

  private handleStopPreview = listen(RendererActions.stopPreview, () => {
    this.engine.stopCurrentRendering()
    this.audioBufferSource && this.audioBufferSource.stop()
    this.updateWith(s => (s.previewPlaying = false))
  })

  private handleSeekPreviewFrame = listen(EditorActions.seekPreviewFrame, async payload => {
    const { frame } = payload
    const targetComposition = this.state.composition!

    this.engine.setStreamObserver({
      onFrame: canvas => this.destCanvasCtx!.drawImage(canvas, 0, 0),
    })

    this.updateWith(state => (state.framePreviewWaiting = true))

    await this.engine!.renderFrame(targetComposition.id, frame).catch(e => {
      // tslint:disable-next-line
      console.error(e)
    })

    this.updateWith(state => (state.framePreviewWaiting = false))
  })

  private handleSetInRenderingStatus = listen(RendererActions.setInRenderingStatus, ({ isInRendering }) => {
    this.updateWith(draft => (draft.isInRendering = isInRendering))
  })

  private setSetRenderingProgress = listen(RendererActions.setRenderingProgress, ({ progress }) => {
    this.updateWith(draft => (draft.exportRenderState = progress))
  })

  constructor(context: StoreContext) {
    super(context)
    this.pluginRegistry = this.engine.pluginRegistry
  }

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
