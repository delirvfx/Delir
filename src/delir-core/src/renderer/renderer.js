// @flow
import type Project from '../project/project'

import Canvas from '../abstraction/canvas'
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
        destinationNode: ?AudioNode,
        requestAnimationFrame: Function,
    } = {
        project: null,
        pluginRegistry: null,
        rootCompId: null,
        beginFrame: 0,
        destinationCanvas: null,
        destinationNode: null,
        requestAnimationFrame: process.nextTick,
    }) : ProgressPromise
    {
        console.log('begin')
        return new ProgressPromise(async (
            resolve: Function,
            reject: Function,
            onAbort: Function,
            notifier: Function,
        ) => {
            let aborted = false
            onAbort(() => aborted = true)
            notifier({state: 'assertion', finished: 0})

            if (req.project == null) throw new RenderingFailedException(`option.project must be specified.`)
            if (req.pluginRegistry == null) throw new RenderingFailedException(`option.pluginRegistry must be specified.`)
            if (req.rootCompId == null) throw new RenderingFailedException(`option.rootCompId must be specified.`)
            if (req.destinationCanvas == null) throw new RenderingFailedException(`option.destinationCanvas must be specified.`)

            const destCanvasCtx = req.destinationCanvas.getContext('2d')
            if (destCanvasCtx == null) throw new RenderingFailedException('Canvas context initializing failed. (Do not get the WebGL context?)')

            const rootComp = ProjectHelper.findCompositionById(req.project, req.rootCompId)
            if (rootComp == null) throw new RenderingFailedException(`Specified compositon not found (id:${req.rootCompId})`)

            const rootCompContainer: CompositionInstanceContainer = new CompositionInstanceContainer(rootComp)
            const resolver: EntityResolver = new EntityResolver(req.project, req.pluginRegistry)

            try {
                notifier({state: 'initialize renderer', finished: 0})
                await rootCompContainer.beforeRender(new PreRenderingRequest({
                    width: rootCompContainer.width,
                    height: rootCompContainer.height,
                    framerate: rootCompContainer.framerate,
                    durationFrames: rootCompContainer.durationFrame,
                    rootComposition: rootCompContainer,
                    resolver: resolver,
                }))
            } catch (e) {
                throw new RenderingFailedException(`Components initialization failed. (${e.message})`, {before: e})
            }

            // Initialize render requests
            notifier({state: 'initialize request', finished: 0})
            let renderedFrames = 0
            let durationFrames = rootCompContainer.durationFrame

            const bufferCanvas: HTMLCanvasElement = new Canvas
            const bufferCanvasCtx = bufferCanvas.getContext('2d')
            if (bufferCanvasCtx == null) throw new RenderingFailedException(`Buffer canvas initialize failed`)

            bufferCanvas.width = rootCompContainer.width
            bufferCanvas.height = rootCompContainer.height

            const baseRequest = new RenderRequest({
                frame: req.beginFrame,

                width: rootCompContainer.width,
                height: rootCompContainer.height,
                framerate: rootCompContainer.framerate,
                durationFrames: rootCompContainer.durationFrame,

                rootComposition: rootCompContainer,
                resolver: resolver,

                destCanvas: req.destinationCanvas,
            })

            // Render
            if (aborted) return

            notifier({state: 'begin-render', finished: 0})
            const render = async () => {
                bufferCanvasCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height)
                destCanvasCtx.clearRect(0, 0, rootComp.width, rootComp.height)

                const request = baseRequest.set({
                    frame: req.beginFrame + renderedFrames,
                    time: (req.beginFrame + renderedFrames) / baseRequest.framerate,
                })

                if (aborted) return notifier({state: 'aborted'})

                await rootCompContainer.render(request)
                renderedFrames++

                if (aborted) return notifier({state: 'aborted'})
                if (renderedFrames >= rootCompContainer.durationFrame) {
                    notifier({state: 'render-frame', finished: 100})
                    resolve()
                    return
                }

                notifier({state: 'render-frame', finished: renderedFrames / durationFrames})
                req.requestAnimationFrame(render)
            }

            req.requestAnimationFrame(render)
        })
    }
}
