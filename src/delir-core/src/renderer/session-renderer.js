// @flow
import type Composition from '../project/composition'

import _ from 'lodash'

import Deream from '../../../deream'

import Canvas from '../abstraction/canvas'
import NodeCanvas from 'canvas'
import canvasToBuffer from 'electron-canvas-to-buffer'

import Project from '../project/project'
import PluginRegistory from '../services/plugin-registory'
import Renderer from './renderer'

import ProjectInstanceContainer from './project-instance-container'
import CompositionInstanceContainer from './composition-instance-container'
import EntityResolver from './entity-resolver'
import PreRenderingRequest from './pre-rendering-request'
import RenderRequest from './render-request'

import * as Helper from '../helper/helper'
import ProgressPromise from '../helper/progress-promise'

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
        currentFrame: number,
        renderedFrames: number,
        lastRenderedFrame: number,
        animationFrameId: ?number,
    }

    get session(): Object
    {
        return Object.assign(
            {playing: false},
            _.pick(this._playingSession, [
                'playing',
                'durationFrames',
                'renderedFrames',
                'lastRenderedFrame',
            ])
        )
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
        beginFrame: number,
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
                frame: req.beginFrame,

                width: compWrap.width,
                height: compWrap.height,
                framerate: compWrap.framerate,
                durationFrames: rootComp.durationFrame,
                destCanvas: bufferCanvas,
                // audioDestNode: this.audioDest

                resolver: resolver,
            }),
            bufferCanvas,
            rootComp: compWrap,
            renderedFrames: 0,
            lastRenderedFrame: 0,
            durationFrames: rootComp.durationFrame,
            animationFrameId: null,
        }
    }

    async render(req: {
        beginFrame: number,
        targetCompositionId: string,
    }) : Promise
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
            await rootCompWrap.beforeRender(new PreRenderingRequest({
                width: baseRequest.width,
                height: baseRequest.height,
                framerate: baseRequest.framerate,
                durationFrames: baseRequest.durationFrames,
                rootComposition: baseRequest.rootComposition,
                resolver,
            }))

        } catch (e) {
            throw new Error(e.stack)
        }

        if (this._playingSession == null) {
            // Already aborted
            return
        }

        // TODO: "Real time" based time calculation
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
            this._playingSession.lastRenderedFrame = req.beginFrame + this._playingSession.renderedFrames

            if (this._playingSession.renderedFrames >= this._playingSession.durationFrames) {
                this._playingSession = null
                return
            }

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

    async export(req: {
        exportPath: stirng,
        targetCompositionId: string,
    })
    {
        //
        // export via deream
        //
        const rootComp: Compositon = Helper.findCompositionById(this.project, req.targetCompositionId)
        const durationFrames = rootComp.durationFrame

        // const canvas = new NodeCanvas(rootComp.width, rootComp.height)
        const canvas = document.createElement('canvas')
        canvas.width = rootComp.width
        canvas.height = rootComp.height

        const ctx = canvas.getContext('2d')
        const deream = Deream({
            args: {
                'c:v': 'libx264',
                'b:v': '1024k',
                'r': rootComp.framerate,
                'an': ''
            },
            inputFrames: rootComp.framerate,
            dest: req.exportPath,
        })

        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('run');

        // const encoder = spawn('ffmpeg', `-i pipe:0 -r ${durationFrames} -c:v mjpeg -c:v libx264 -r ${durationFrames} -s 640x360 test.mp4`.split(' '))
        // encoder.stderr.on('data', data => console.log(data.toString()))

        const progPromise = Renderer.render({
            project: this.project,
            pluginRegistry: this.pluginRegistory,
            rootCompId: req.targetCompositionId,
            beginFrame: 0,
            destinationCanvas: canvas,
            // destinationNode: ?AudioNode,
            requestAnimationFrame: window.requestAnimationFrame.bind(window),
        })

        progPromise.progress(progress => {
            console.log(progress);

            if (progress.state === 'render-frame') {
                // let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
                // console.log(imageData);
                // let buffer = new Buffer(imageData)
                deream.write(canvasToBuffer(canvas, 'image/png'))
            }

            if (progress.finished === 100) {
                deream.end()
                window.alert('complete')
            }
        })

        return progPromise



        // const buf = new ArrayBuffer(mediaInfo.width * mediaInfo.height * 4)
        // const view = new Uint8ClampedArray(buf)

        // const VIDEO_DURATION_SEC = 1



        // try { fs.unlinkSync('test.mp4') } catch (e) {}



        // for (let i = 0; i < OUTPUT_FRAMES; i++) {
        //     // ctx.fillStyle = '#' + [cRand(), cRand(), cRand()].join('')
        //     // ctx.fillRect(0, 0, 640, 360)
        //
        //     let buffer = canvasToBuffer(canvas, 'image/jpeg')
        //     encoder.stdin.write(buffer)
        // }

        // encoder.stdin.end()
    }
}
