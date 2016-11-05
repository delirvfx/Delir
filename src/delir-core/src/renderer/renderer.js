// @flow
import type Project from '../project/project'

import _ from 'lodash'

import Canvas from '../abstraction/canvas'
import AudioContext from '../abstraction/audio-context'
import CompositionInstanceContainer from './composition-instance-container'
import EntityResolver from './entity-resolver'
import PluginRegistory from '../services/plugin-registory'
import PreRenderingRequest from './pre-rendering-request'
import ProgressPromise from '../helper/progress-promise'
import * as ProjectHelper from '../helper/helper'
import RenderRequest from './render-request'
import RenderingFailedException from '../exceptions/rendering-failed-exception'

export default class Renderer {
    static render(req : {
        project: ?Project,
        pluginRegistry: ?PluginRegistory,
        rootCompId: ?string,
        beginFrame: ?number,
        destinationCanvas: ?HTMLCanvasElement,
        destinationAudioBuffer: ?Array<Float32Array>,
        requestAnimationFrame: Function,
    } = {
        project: null,
        pluginRegistry: null,
        rootCompId: null,
        beginFrame: 0,
        destinationCanvas: null,
        destinationAudioBuffer: null,
        requestAnimationFrame: process.nextTick,
    }) : ProgressPromise
    {
        return new ProgressPromise(async (
            resolve: Function,
            reject: Function,
            onAbort: Function,
            notifier: Function,
        ) => {
            let aborted = false
            onAbort(() => aborted = true)
            notifier({state: 'Assertion', finished: 0})

            if (req.project == null) throw new RenderingFailedException(`option.project must be specified.`)
            if (req.pluginRegistry == null) throw new RenderingFailedException(`option.pluginRegistry must be specified.`)
            if (req.rootCompId == null) throw new RenderingFailedException(`option.rootCompId must be specified.`)
            if (req.destinationCanvas == null) throw new RenderingFailedException(`option.destinationCanvas must be specified.`)

            const rootComp = ProjectHelper.findCompositionById(req.project, req.rootCompId)
            if (rootComp == null) throw new RenderingFailedException(`Specified compositon not found (id:${req.rootCompId})`)

            const rootCompContainer: CompositionInstanceContainer = new CompositionInstanceContainer(rootComp)

            const destCanvas = new Canvas()
            const destCanvasCtx = destCanvas.getContext('2d')
            if (destCanvasCtx == null) throw new RenderingFailedException('Canvas context initializing failed. (Do not get the WebGL context?)')

            const destAudioCtx = new AudioContext()
            const destAudioBuffer = _.times(rootComp.audioChannels, () => new Float32Array(new ArrayBuffer(4 /* bytes */ * 16384)))

            const resolver: EntityResolver = new EntityResolver(req.project, req.pluginRegistry)

            try {
                notifier({state: 'Initialize renderers', finished: 0})

                await rootCompContainer.beforeRender(new PreRenderingRequest({
                    width           : rootCompContainer.width,
                    height          : rootCompContainer.height,
                    framerate       : rootCompContainer.framerate,
                    durationFrames  : rootCompContainer.durationFrames,

                    audioContext    : destAudioCtx,
                    samplingRate    : rootCompContainer.samplingRate,
                    audioBufferSize : 16384,
                    audioChannels   : 16384,

                    rootComposition : rootCompContainer,
                    resolver        : resolver,
                }))
            } catch (e) {
                throw new RenderingFailedException(`Components initialization failed. (${e.message})`, {before: e})
            }

            // Initialize render requests
            notifier({state: 'Initialize render request', finished: 0})
            let renderedFrames = 0
            let durationFrames = rootCompContainer.durationFrames

            const bufferCanvas: HTMLCanvasElement = new Canvas
            const bufferCanvasCtx = bufferCanvas.getContext('2d')
            if (bufferCanvasCtx == null) throw new RenderingFailedException(`Buffer canvas initialize failed`)

            bufferCanvas.width = rootCompContainer.width
            bufferCanvas.height = rootCompContainer.height

            const baseRequest = new RenderRequest({
                frame           : req.beginFrame,

                destCanvas      : req.destinationCanvas,
                width           : rootCompContainer.width,
                height          : rootCompContainer.height,
                framerate       : rootCompContainer.framerate,
                durationFrames  : rootCompContainer.durationFrames,

                destAudioBuffer: destAudioBuffer,
                audioContext: destAudioCtx,
                samplingRate: rootCompContainer.samplingRate,
                neededSamples: 16384,
                audioChannels: rootCompContainer.audioChannels,

                rootComposition : rootCompContainer,
                resolver        : resolver,
            })

            // Render
            if (aborted) return

            notifier({state: 'Rendering started', finished: 0})
            const render = async () => {
                const request = baseRequest.set({
                    frame: req.beginFrame + renderedFrames,
                    time: (req.beginFrame + renderedFrames) / baseRequest.framerate,
                    isBufferingFrame: (renderedFrames / baseRequest.framerate) % 1 === 0,
                })

                bufferCanvasCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height)
                for (let ch = 0, l = rootComp.audioChannels; ch < l; ch++) {
                    destAudioBuffer[ch].fill(0)
                }

                if (aborted) return notifier({state: 'aborted'})

                await rootCompContainer.render(request)
                renderedFrames++

                if (aborted) return notifier({state: 'aborted'})
                if (renderedFrames >= rootCompContainer.durationFrames) {
                    notifier({
                        state: `Rendering... ${renderedFrames} / ${durationFrames}`,
                        isRendering: true,
                        renderedFrame: renderedFrames - 1,
                        finished: 100
                    })
                    resolve()
                    return
                }

                notifier({
                    state: `Rendering... ${renderedFrames} / ${durationFrames}`,
                    isRendering: true,
                    renderedFrame: renderedFrames - 1,
                    finished: renderedFrames / durationFrames
                })
                req.requestAnimationFrame(render)
            }

            req.requestAnimationFrame(render)
        })
    }
}
