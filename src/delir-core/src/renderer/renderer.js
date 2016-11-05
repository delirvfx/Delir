// @flow
import type Composition from '../project/composition'

import _ from 'lodash'

import Deream from '../../../deream'

import Canvas from '../abstraction/canvas'
import NodeCanvas from 'canvas'
import canvasToBuffer from 'electron-canvas-to-buffer'

import Project from '../project/project'
import PluginRegistory from '../services/plugin-registory'

import ProjectInstanceContainer from './project-instance-container'
import CompositionInstanceContainer from './composition-instance-container'
import EntityResolver from './entity-resolver'
import PreRenderingRequest from './pre-rendering-request'
import RenderRequest from './render-request'

import * as Helper from '../helper/helper'
import ProgressPromise from '../helper/progress-promise'

import {RenderingFailedException} from '../exceptions/'

export default class Renderer {
    static AUDIO_BUFFER_SIZE = 16384

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
    }) : ProgressPromise {
        const renderer = new Renderer({
            project: req.project,
            pluginRegistry: req.pluginRegistry,
        })

        renderer.setDestinationCanvas(req.destinationCanvas)
        renderer.setDestinationAudioNode(node)

        renderer.render({
            beginFrame: req.beginFrame,
            targetCompositionId: req.rootCompId,
        })
    }


    // plugins: PluginContainer

    _animationFrameId: number

    _pluginRegistry : PluginRegistory
    _project: Project

    // audioDest: ?any
    // imageDest: ?any

    _destinationCanvas: HTMLCanvasElement // Canvas
    _destinationAudioBuffer: Array<Float32Array>
    _audioContext: AudioContext // AudioContext.destination

    _playingSession: {
        playing: boolean,
        baseRequest: RenderRequest,
        bufferCanvas: HTMLCanvasElement,

        bufferAudioBuffer: Array<Float32Array>,

        rootCompContainer: CompositionInstanceContainer,
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
        pluginRegistry: ?PluginRegistory,
        project: ?Project,
    } = {
        pluginRegistry: null,
        project: null,
    }) {
        options.pluginRegistry && (this._pluginRegistry = options.pluginRegistry)
        options.project && (this._project = options.project)

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
        // this._project = ProjectInstanceContainer.open(project)
        console.log(project);
        this._project = project
    }

    setDestinationCanvas(canvas: HTMLCanvasElement)
    {
        this._destinationCanvas = canvas
    }

    setDestinationAudioBuffer(buffer: Array<Float32Array>)
    {
        this._destinationAudioBuffer = buffer
    }

    // setDestinationAudioNode(node: AudioNode)
    // {
    //     this._destinationAudioNode = node
    // }
    //
    setAudioContext(context: AudioContext)
    {
        this._audioContext = context
        // this.audioBufferNode.connect(node)
    }

    initializePlayingSession(req: {
        beginFrame: number,
        targetCompositionId: string,
    })
    {
        //
        // Composition
        //
        const rootComp = Helper.findCompositionById(this._project, req.targetCompositionId)
        if (rootComp == null) { return }

        const rootCompWrap: CompositionInstanceContainer = new CompositionInstanceContainer(rootComp)

        //
        // Destinations
        //
        const bufferCanvas: HTMLCanvasElement = new Canvas()
        const ctx = bufferCanvas.getContext('2d')

        bufferCanvas.width = rootComp.width
        bufferCanvas.height = rootComp.height

        if (ctx == null) { return } // for flowtype lint

        const bufferAudioBuffer = _.times(rootComp.audioChannels, () => new Float32Array(new ArrayBuffer(4 /* bytes */ * Renderer.AUDIO_BUFFER_SIZE)))

        //
        // Resolver
        //
        const resolver: EntityResolver = new EntityResolver(this._project, this._pluginRegistry)

        //
        // make render session / request
        //
        const baseRequest = new RenderRequest({
            frame: req.beginFrame,

            destCanvas: bufferCanvas,
            width: rootCompWrap.width,
            height: rootCompWrap.height,
            framerate: rootCompWrap.framerate,
            durationFrames: rootComp.durationFrames,

            destAudioBuffer: bufferAudioBuffer,
            audioContext: this._audioContext,
            samplingRate: rootCompWrap.samplingRate,
            neededSamples: Renderer.AUDIO_BUFFER_SIZE,
            audioChannels: rootCompWrap.audioChannels,

            resolver: resolver,
        })

        this._playingSession = {
            playing: true,
            baseRequest,
            bufferCanvas,

            bufferAudioBuffer: bufferAudioBuffer,
            // bufferNode: bufferNode,

            rootCompContainer: rootCompWrap,
            renderedFrames: 0,
            lastRenderedFrame: 0,
            durationFrames: rootComp.durationFrames,

            renderStartTime: null,
            animationFrameId: null,
        }
    }

    render(req: {
        beginFrame: number,
        // TODO: endFrame: number,
        // TODO: loop: boolean,
        targetCompositionId: string,
    }) : Promise
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

            console.log(this)
            if (this._project == null) throw new RenderingFailedException(`option.project must be specified.`)
            if (this._pluginRegistry == null) throw new RenderingFailedException(`option.pluginRegistry must be specified.`)
            if (this._destinationCanvas == null) throw new RenderingFailedException(`option.destinationCanvas must be specified.`)
            if (this._destinationAudioBuffer == null) throw new RenderingFailedException(`option.destinationAudioBuffer must be specified.`)
            if (req.targetCompositionId == null) throw new RenderingFailedException(`option.rootCompId must be specified.`)

            //
            // Initializing
            //
            console.log('start render');

            // const v = document.createElement('video')
            // v.src = document.querySelector('video').src
            // v.play()
            //
            // const s = this.destinationAudioCtx.createMediaElementSource(v)
            // s.connect(this.audioBufferNode)
            // this.audioBufferNode.connect(this.destinationAudioCtx.destination)

            if (this._destinationCanvas == null) {
                throw new Error('set destination canvas before rendering')
            }

            if (this._audioContext == null) {
                throw new Error('set AudioContext before rendering')
            }

            if (this._playingSession == null) {
                this.initializePlayingSession(req)
            }

            notifier({state: 'Initialize renderers', finished: 0})

            //
            // Caching
            //
            const session = this._playingSession
            const {baseRequest} = session

            const rootCompContainer = session.rootCompContainer
            const {width: compWidth, height: compHeight} = rootCompContainer

            const {bufferCanvas} = session
            const bufferCanvasCtx = bufferCanvas.getContext('2d')
            if (bufferCanvasCtx == null) throw new Error('Failed create Canvas2D context on buffer canvas')

            const {bufferAudioBuffer} = session

            const destCanvas = this._destinationCanvas
            const {width: destCanvasWidth, height: destCanvasHeight} = this._destinationCanvas
            const destCanvasCtx = destCanvas.getContext('2d')
            if (destCanvasCtx == null) throw new Error('Failed create Canvas2D context on destination canvas')

            const destAudioBuffer = this._destinationAudioBuffer

            const resolver = session.baseRequest.resolver

            //
            // Before rendering
            //
            try {
                await rootCompContainer.beforeRender(new PreRenderingRequest({
                    width: baseRequest.width,
                    height: baseRequest.height,
                    framerate: baseRequest.framerate,
                    durationFrames: baseRequest.durationFrames,

                    audioContext: this._audioContext,
                    samplingRate: baseRequest.samplingRate,
                    audioBufferSize: baseRequest.neededSamples,
                    audioChannels: baseRequest.audioChannels,

                    rootComposition: baseRequest.rootComposition,
                    resolver,
                }))

                console.log('end before render');
            } catch (e) {
                throw new Error(e.stack)
            }

            if (session == null) {
                // Already aborted
                return
            }

            //
            // Rendering
            //

            // TODO: "Real time" based time calculation
            session.renderStartTime = Date.now()
            let lastBufferingTime = -1
            let bufferingIntervalTime = Renderer.AUDIO_BUFFER_SIZE / rootCompContainer.samplingRate

            notifier({state: 'Rendering started', finished: 0})
            const render = async (): any => {
                const elapsed = (Date.now() - session.renderStartTime) / 1000
                const currentTime = session.renderedFrames / rootCompContainer.framerate

                const _renderReq = baseRequest.set({
                    // time: elapsed,
                    // frame: elapsed * rootCompWrap.framerate,
                    time: currentTime,
                    frame: baseRequest.frame + session.renderedFrames,

                    isBufferingFrame: true, //lastBufferingTime !== Math.ceil(currentTime / bufferingIntervalTime),
                })

                console.log(lastBufferingTime !== Math.ceil(currentTime / bufferingIntervalTime));
                lastBufferingTime = Math.ceil(_renderReq.time / bufferingIntervalTime),

                //
                // Clear buffer
                //
                bufferCanvasCtx.clearRect(0, 0, compWidth, compHeight)
                for (const ch = 0, l = rootCompContainer.audioChannels; ch < l; ch++) {
                    destAudioBuffer[ch].fill(0)
                }

                //
                // Render
                //
                if (aborted) return notifier({state: 'aborted'})
                await rootCompContainer.render(_renderReq)
                if (aborted) return notifier({state: 'aborted'})

                //
                // Copy rendered image from buffer
                //
                destCanvasCtx.clearRect(0, 0, destCanvasWidth, destCanvasHeight)
                destCanvasCtx.drawImage(
                    bufferCanvas,
                    0, 0, compWidth, compHeight,
                    0, 0, destCanvasWidth, destCanvasHeight
                )

                for (let ch = 0, l = rootCompContainer.audioChannels; ch < l; ch++) {
                    destAudioBuffer[ch].set(bufferAudioBuffer[ch])
                }

                // console.log(session.renderedFrames = elapsed * rootCompWrap.framerate)
                // session.lastRenderedFrame = req.beginFrame + session.renderedFrames

                if (session.renderedFrames >= session.durationFrames) {
                    notifier({
                        state: `Rendering... ${session.renderedFrames} / ${session.durationFrames}`,
                        isRendering: true,
                        renderedFrame: session.renderedFrames,
                        finished: 100
                    })
                    notifier({
                        state: `Completed`,
                        isCompleted: true,
                        finished: 100
                    })
                    this.stop()
                    resolve()
                    return
                }

                notifier({
                    state: `Rendering... ${session.renderedFrames} / ${session.durationFrames}`,
                    isRendering: true,
                    renderedFrame: session.renderedFrames,
                    finished: 100
                })

                session.renderedFrames++
                session.animationFrameId = requestAnimationFrame(render)
            }

            session.animationFrameId = requestAnimationFrame(render)
        })
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
        const rootComp: Compositon = Helper.findCompositionById(this._project, req.targetCompositionId)
        const durationFrames = rootComp.durationFrames

        // const canvas = new NodeCanvas(rootComp.width, rootComp.height)
        const canvas = document.createElement('canvas')
        canvas.width = rootComp.width
        canvas.height = rootComp.height

        const ctx = canvas.getContext('2d')
        const audioBuffer =　_.times(rootComp.audioChannels, () => new Float32Array(new ArrayBuffer(4 /* bytes */ * Renderer.AUDIO_BUFFER_SIZE)))
        const pcmAudioData = _.times(rootComp.audioChannels, () => new Float32Array(new ArrayBuffer(4 /* bytes */ * Renderer.AUDIO_BUFFER_SIZE * Math.ceil(durationFrames / rootComp.framerate))))

        const deream = Deream.video({
            args: {
                'c:v': 'libx264',
                'b:v': '1024k',
                'pix_fmt': 'yuv420p',
                // 'r': rootComp.framerate,
                // 'an': ''
            },
            inputFramerate: rootComp.framerate,
            dest: req.exportPath,
        })

        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('run');

        // const encoder = spawn('ffmpeg', `-i pipe:0 -r ${durationFrames} -c:v mjpeg -c:v libx264 -r ${durationFrames} -s 640x360 test.mp4`.split(' '))
        // encoder.stderr.on('data', data => console.log(data.toString()))

        const progPromise = Renderer.render({
            project: this._project,
            pluginRegistry: this._pluginRegistry,
            rootCompId: req.targetCompositionId,
            beginFrame: 0,
            destinationCanvas: canvas,
            destinationAudioBuffer: audioBuffer,
            requestAnimationFrame: window.requestAnimationFrame.bind(window),
        })

        let audioDataOffset = 0
        progPromise.progress(progress => {
            console.log(progress);

            if (progress.isRendering) {
                // let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
                // console.log(imageData);
                // let buffer = new Buffer(imageData)
                deream.write(canvasToBuffer(canvas, 'image/png'))

                if ((progress.renderedFrames / rootComp.framerate) % 1 === 0) {
                    for (let ch = 0, l = rootComp.audioChannels; ch < l; ch++) {
                        pcmAudioData[ch].set(audioBuffer[ch], Renderer.AUDIO_BUFFER_SIZE * audioDataOffset)
                        audioBuffer[ch].fill(0)
                    }
                    audioDataOffset++
                }
            }

            if (progress.finished === 100) {
                deream.end()
                console.log(pcmAudioData);
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
