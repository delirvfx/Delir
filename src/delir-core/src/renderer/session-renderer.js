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

export const AUDIO_BUFFER_SIZE = 16384

export default class SessionRenderer {
    // plugins: PluginContainer

    _animationFrameId: number

    _pluginRegistory : PluginRegistory
    _project: Project

    // audioDest: ?any
    // imageDest: ?any

    _destinationCanvas: HTMLCanvasElement // Canvas
    _destinationAudioNode: AudioNode
    _audioContext: AudioContext // AudioContext.destination

    _playingSession: {
        playing: boolean,
        baseRequest: RenderRequest,
        bufferCanvas: HTMLCanvasElement,
        destAudioBuffer: Array<Float32Array>,
        bufferNode: AudioNode,
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
        options.pluginRegistory && (this._pluginRegistory = options.pluginRegistory)
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
        this._project = project
    }

    setDestinationCanvas(canvas: HTMLCanvasElement)
    {
        this._destinationCanvas = canvas
    }

    setDestinationAudioNode(node: AudioNode)
    {
        this._destinationAudioNode = node
    }

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
        // Composition
        const rootComp = Helper.findCompositionById(this._project, req.targetCompositionId)
        if (rootComp == null) { return }

        const compWrap: CompositionInstanceContainer = new CompositionInstanceContainer(rootComp)

        // Destinations
        const bufferCanvas: HTMLCanvasElement = new Canvas()
        const ctx = bufferCanvas.getContext('2d')

        bufferCanvas.width = rootComp.width
        bufferCanvas.height = rootComp.height

        if (ctx == null) { return } // for flowtype lint

        const destAudioBuffer = _.times(rootComp.audioChannels, () => new Float32Array(new ArrayBuffer(4 /* bytes */ * AUDIO_BUFFER_SIZE)))
        const bufferNode = this._audioContext.createScriptProcessor(AUDIO_BUFFER_SIZE, compWrap.audioChannels, 2)
        bufferNode.onaudioprocess = e => {
            for (const ch = 0, l = compWrap.audioChannels; ch < l; ch++) {
                console.log(destAudioBuffer);
                e.outputBuffer.getChannelData(ch).set(destAudioBuffer[ch])
            }
        }
        bufferNode.connect(this._destinationAudioNode)

        const resolver: EntityResolver = new EntityResolver(this._project, this._pluginRegistory)

        // make render session / request
        const baseRequest = new RenderRequest({
            frame: req.beginFrame,

            destCanvas: bufferCanvas,
            width: compWrap.width,
            height: compWrap.height,
            framerate: compWrap.framerate,
            durationFrames: rootComp.durationFrames,

            destAudioBuffer: destAudioBuffer,
            audioContext: this._audioContext,
            samplingRate: compWrap.samplingRate,
            neededSamples: AUDIO_BUFFER_SIZE,
            audioChannels: compWrap.audioChannels,

            resolver: resolver,
        })


        this._playingSession = {
            playing: true,
            baseRequest,
            bufferCanvas,

            destAudioBuffer,
            bufferNode,

            rootComp: compWrap,
            renderedFrames: 0,
            lastRenderedFrame: 0,
            durationFrames: rootComp.durationFrames,

            renderStartTime: null,
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

        if (this._destinationCanvas == null) {
            throw new Error('set destination canvas before rendering')
        }

        if (this._audioContext == null) {
            throw new Error('set AudioContext before rendering')
        }

        if (this._playingSession == null) {
            this.initializePlayingSession(req)
        }

        const rootCompWrap = this._playingSession.rootComp
        const {width: compWidth, height: compHeight} = rootCompWrap
        const resolver = this._playingSession.baseRequest.resolver
        const {bufferCanvas, destAudioBuffer, baseRequest} = this._playingSession
        const bufferCanvasCtx = bufferCanvas.getContext('2d')
        if (bufferCanvasCtx == null) throw new Error('Failed create Canvas2D context')

        const destCanvas = this._destinationCanvas
        const {width: destCanvasWidth, height: destCanvasHeight} = this._destinationCanvas
        const destCanvasCtx = destCanvas.getContext('2d')
        if (destCanvasCtx == null) throw new Error('Failed create Canvas2D context')

        //
        // Before rendering
        //
        try {
            await rootCompWrap.beforeRender(new PreRenderingRequest({
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

        if (this._playingSession == null) {
            // Already aborted
            return
        }

        //
        // Rendering
        //

        // TODO: "Real time" based time calculation
        this._playingSession.renderStartTime = Date.now()
        let lastBufferingTime = -1
        let bufferingIntervalTime = AUDIO_BUFFER_SIZE / rootCompWrap.samplingRate
        const render = async (): any => {
            const elapsed = (Date.now() - this._playingSession.renderStartTime) / 1000
            const currentTime = this._playingSession.renderedFrames / rootCompWrap.framerate

            const _renderReq = baseRequest.set({
                // time: elapsed,
                // frame: elapsed * rootCompWrap.framerate,
                time: currentTime,
                frame: baseRequest.frame + this._playingSession.renderedFrames,

                isBufferingFrame: lastBufferingTime !== Math.ceil(currentTime / bufferingIntervalTime),
            })

            console.log(lastBufferingTime !== Math.ceil(currentTime / bufferingIntervalTime));
            lastBufferingTime = Math.ceil(_renderReq.time / bufferingIntervalTime),

            // Clear buffer
            bufferCanvasCtx.clearRect(0, 0, compWidth, compHeight)
            for (const ch = 0, l = rootCompWrap.audioChannels; ch < l; ch++) {
                destAudioBuffer[ch].fill(0)
            }

            await rootCompWrap.render(_renderReq)

            // Copy rendered image from buffer
            destCanvasCtx.clearRect(0, 0, destCanvasWidth, destCanvasHeight)
            destCanvasCtx.drawImage(
                bufferCanvas,
                0, 0, compWidth, compHeight,
                0, 0, destCanvasWidth, destCanvasHeight
            )

            // console.log(this._playingSession.renderedFrames = elapsed * rootCompWrap.framerate)
            this._playingSession.lastRenderedFrame = req.beginFrame + this._playingSession.renderedFrames

            if (this._playingSession.renderedFrames >= this._playingSession.durationFrames) {
                this.stop()
                return
            }

            this._playingSession.renderedFrames++
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
        this._playingSession.bufferNode.disconnect(this._destinationAudioNode)
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
        const audioBuffer =　_.times(rootComp.audioChannels, () => new Float32Array(new ArrayBuffer(4 /* bytes */ * AUDIO_BUFFER_SIZE)))
        const pcmAudioData = _.times(rootComp.audioChannels, () => new Float32Array(new ArrayBuffer(4 /* bytes */ * AUDIO_BUFFER_SIZE * Math.ceil(durationFrames / rootComp.framerate))))

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
            pluginRegistry: this._pluginRegistory,
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
                        pcmAudioData[ch].set(audioBuffer[ch], AUDIO_BUFFER_SIZE * audioDataOffset)
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
