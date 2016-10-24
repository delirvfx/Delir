// @flow
import Canvas from '../abstraction/canvas'

import Project from "../project/project"
import PluginRegistory from '../services/plugin-registory'

import ProjectInstanceContainer from './project-instance-container'
import CompositionInstanceContainer from './composition-instance-container'
import EntityResolver from './entity-resolver'
import PreRenderingRequest from './pre-rendering-request'
import RenderRequest from './render-request'

import * as Helper from '../helper/helper'

export default class SessionRenderer {
    // plugins: PluginContainer

    _animationFrameId: number

    pluginRegistory : PluginRegistory
    project: Project

    // audioDest: ?any
    // imageDest: ?any

    destinationCanvas: HTMLCanvasElement // Canvas
    destinationAudioNode: AudioNode // AudioContext.destination

    _playingSession: {
        playing: boolean,
        baseRequest: RenderRequest,
        bufferCanvas: HTMLCanvasElement,
        rootComp: CompositionInstanceContainer,
        durationFrames: number,
        renderedFrames: number,
        animationFrameId: ?number,
    }

    constructor(options: {
        pluginRegistory: ?PluginRegistory,
        project: ?Project,
    } = {
        pluginRegistory: null,
        project: null,
    }) {
        options.pluginRegistory && (this.pluginRegistory = options.pluginRegistory)
        options.project && (this.project = options.project)

        // if (typeof window !== 'undefined') {
        //     this.audioCtx = new AudioContext()
        // } else {
        //     this.audioCtx = new (require('node-web-audio-api'))
        // }

        // this.audioBufferNode = this.audioCtx.createScriptProcessor(4096)
        // this.audioBufferNode.onaudioprocess = (e) => {
        //     console.log(inputBuffer);
        //     e.outputBuffer = e.inputBuffer
        // }
    }

    setProject(project: Project)
    {
        // this.project = ProjectInstanceContainer.open(project)
        this.project = project
    }

    setDestinationCanvas(canvas: HTMLCanvasElement)
    {
        this.destinationCanvas = canvas
    }

    setDestinationAudioNode(node: AudioNode)
    {
        this.destinationAudioNode = node
        // this.audioBufferNode.connect(node)
    }

    // setDestinationAudioContext(ctx)
    // {
    //     this.destinationAudioCtx = ctx
    //     this.audioBufferNode = ctx.createScriptProcessor(4096)
    //     this.audioBufferNode.onaudioprocess = (e) => {
    //         // console.log(e.inputBuffer);
    //
    //         const srcCh0 = e.inputBuffer.getChannelData(0)
    //         const srcCh1 = e.inputBuffer.getChannelData(1)
    //
    //         const dstCh0 = e.outputBuffer.getChannelData(0)
    //         const dstCh1 = e.outputBuffer.getChannelData(1)
    //
    //         for (let i = 4095; i; i--) {
    //             dstCh0[i] = srcCh0[i]
    //             dstCh1[i] = srcCh1[i]
    //         }
    //     }
    // }

    initializePlayingSession(req: {
        frame: number,
        targetCompositionId: string,
    })
    {
        const rootComp = Helper.findCompositionById(this.project, req.targetCompositionId)

        if (rootComp == null) { return }
        const compWrap = new CompositionInstanceContainer(rootComp)

        const bufferCanvas: HTMLCanvasElement = new Canvas()
        const ctx = bufferCanvas.getContext('2d')

        bufferCanvas.width = rootComp.width
        bufferCanvas.height = rootComp.height

        if (ctx == null) { return } // for flowtype lint

        // make render session / request
        const resolver: EntityResolver = new EntityResolver(this.project, this.pluginRegistory)

        this._playingSession = {
            playing: true,
            baseRequest: new RenderRequest({
                frame: req.frame,

                width: compWrap.width,
                height: compWrap.height,
                framerate: compWrap.framerate,

                destCanvas: bufferCanvas,
                // audioDestNode: this.audioDest

                resolver: resolver,
            }),
            bufferCanvas,
            rootComp: compWrap,
            renderedFrames: 0,
            durationFrames: rootComp.durationFrame,
            animationFrameId: null,
        }

        console.log(new RenderRequest({
            frame: req.frame,

            width: compWrap.width,
            height: compWrap.height,
            framerate: compWrap.framerate,

            destCanvas: bufferCanvas,
            // audioDestNode: this.audioDest

            resolver: resolver,
        }));
    }

    async render(req: {
        frame: number,
        targetCompositionId: string,
    }) : Promise<void>
    {
        console.log('start render');

        // const v = document.createElement('video')
        // v.src = document.querySelector('video').src
        // v.play()
        //
        // const s = this.destinationAudioCtx.createMediaElementSource(v)
        // s.connect(this.audioBufferNode)
        // this.audioBufferNode.connect(this.destinationAudioCtx.destination)

        if (this.destinationCanvas == null) {
            throw new Error('set destination canvas before rendering')
        }

        if (this._playingSession == null) {
            this.initializePlayingSession(req)
        }

        const rootCompWrap = this._playingSession.rootComp
        const resolver = this._playingSession.baseRequest.resolver
        const {bufferCanvas} = this._playingSession
        const bufferCanvasCtx = bufferCanvas.getContext('2d')
        const {baseRequest} = this._playingSession
        if (bufferCanvasCtx == null) throw new Error('Failed create Canvas2D context')

        const destCanvas = this.destinationCanvas
        const destCanvasCtx = this.destinationCanvas.getContext('2d')
        if (destCanvasCtx == null) throw new Error('Failed create Canvas2D context')

        //
        // Rendering
        //
        try {
            console.log(baseRequest);
            await rootCompWrap.beforeRender(new PreRenderingRequest({
                width: baseRequest.width,
                height: baseRequest.height,
                framerate: baseRequest.framerate,
                rootComposition: baseRequest.rootComposition,
                resolver,
            }))

        } catch (e) {
            throw new Error(e.stack)
        }

        console.log('render', bufferCanvas);
        const render = async (): any => {
            // ctx.fillStyle = '#fff'
            bufferCanvasCtx.clearRect(0, 0, 640, 360)

            const _renderReq = baseRequest.set({
                time: this._playingSession.renderedFrames / rootCompWrap.framerate,
                frame: baseRequest.frame + this._playingSession.renderedFrames,
            })

            // console.group(`frame ${this._playingSession.renderedFrames}`)
            // console.log('requesting...', _renderReq);
            await rootCompWrap.render(_renderReq)
            // console.groupEnd(`frame ${this._playingSession.renderedFrames}`)

            // ctx.drawImage(v, 20, 0)
            destCanvasCtx.clearRect(0, 0, destCanvas.width, destCanvas.height)
            destCanvasCtx.drawImage(
                bufferCanvas,
                0, 0, bufferCanvas.width, bufferCanvas.height,
                0, 0, destCanvas.width, destCanvas.height
            )

            this._playingSession.renderedFrames++

            // if (this._playingSession.renderedFrames >= this._playingSession.durationFrames) {
            //     this._playingSession = null
            //     return
            // }

            this._playingSession.animationFrameId = requestAnimationFrame(render)
        }

        this._playingSession.animationFrameId = requestAnimationFrame(render)
    }

    isPlaying()
    {
        return this._playingSession && this._playingSession.playing
    }

    pause()
    {
        if (this._playingSession.animationFrameId === null) return
        cancelAnimationFrame(this._playingSession.animationFrameId)
        this._playingSession.playing = false
    }

    stop()
    {
        if (this._playingSession.animationFrameId === null) return
        cancelAnimationFrame(this._playingSession.animationFrameId)
        this._playingSession = null
    }

    export(exportPath: stirng)
    {

    }
}
