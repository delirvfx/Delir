// @flow
import * as _ from 'lodash'
import * as fs from 'fs'
import * as path from 'path'

import * as Deream from '../../../deream'
import canvasToBuffer from 'electron-canvas-to-buffer'
import audioBufferToWave from 'audiobuffer-to-wav'
import arrayBufferToBuffer from 'arraybuffer-to-buffer'

import Project from '../project/project'
import Composition from '../project/composition'
import PluginRegistry from '../plugin-support/plugin-registry'

import CompositionInstanceContainer from './composition-instance-container'
import EntityResolver from './entity-resolver'
import PreRenderingRequest from './pre-rendering-request'
import RenderRequest from './render-request'

import * as ProjectHelper from '../helper/project-helper'
import ProgressPromise from '../helper/progress-promise'

import {RenderingFailedException} from '../exceptions/'

// TODO: Split audio concat process
import {spawn} from 'child_process'

interface RenderingSession {
    playing: boolean,
    baseRequest: RenderRequest,
    bufferCanvas: HTMLCanvasElement,

    preDestinationAudioBuffer: Array<Float32Array>,

    rootCompContainer: CompositionInstanceContainer,
    durationFrames: number,

    renderedFrames: number,
    renderStartTime: number|null,
    lastRenderedFrame: number|null,
    animationFrameId: number|null,
}

export default class Renderer {
    static AUDIO_BUFFER_SIZE = 16384

    static render(req : {
        project: Project|null,
        pluginRegistry: PluginRegistry|null,
        rootCompId: string|null,
        beginFrame?: number|null,
        destinationCanvas: HTMLCanvasElement|null,
        destinationAudioBuffers: Array<Float32Array>|null,
        requestAnimationFrame: Function,
    } = {
        project: null,
        pluginRegistry: null,
        rootCompId: null,
        beginFrame: 0,
        destinationCanvas: null,
        destinationAudioBuffers: null,
        requestAnimationFrame: process.nextTick,
    }) : ProgressPromise<any> {
        const renderer = new Renderer({
            project: req.project,
            pluginRegistry: req.pluginRegistry,
        })

        // TODO: Strict types
        renderer.setDestinationCanvas(req.destinationCanvas!)
        renderer.setDestinationAudioBuffer(req.destinationAudioBuffers!)

        return renderer.render({
            beginFrame: req.beginFrame!,
            targetCompositionId: req.rootCompId!,
            throttle: false,
        })
    }


    // plugins: PluginContainer

    _animationFrameId: number

    _pluginRegistry : PluginRegistry
    _project: Project

    // audioDest: ?any
    // imageDest: ?any

    _destinationCanvas: HTMLCanvasElement // Canvas
    _destinationAudioBuffer: Array<Float32Array>
    _audioContext: AudioContext // AudioContext.destination

    _playingSession: RenderingSession

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
        pluginRegistry: PluginRegistry|null,
        project: Project|null,
    } = {
        pluginRegistry: null,
        project: null,
    }) {
        options.pluginRegistry && (this._pluginRegistry = options.pluginRegistry)
        options.project && (this._project = options.project)
    }

    get isPlaying()
    {
        return !!(this._playingSession && this._playingSession.playing)
    }

    stop()
    {
        if (!this._playingSession) return
        this.pause()
        this._playingSession = null
    }

    pause()
    {
        if (!this._playingSession) return

        if (this._playingSession.animationFrameId != null) {
            cancelAnimationFrame(this._playingSession.animationFrameId)
        }

        this._playingSession.playing = false
    }

    setProject(project: Project)
    {
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
        const rootComp = ProjectHelper.findCompositionById(this._project, req.targetCompositionId)
        if (rootComp == null) { return }

        const rootCompWrap: CompositionInstanceContainer = new CompositionInstanceContainer(rootComp)

        //
        // Destinations
        //
        const bufferCanvas: HTMLCanvasElement = document.createElement('canvas')
        const ctx = bufferCanvas.getContext('2d')

        bufferCanvas.width = rootComp.width
        bufferCanvas.height = rootComp.height

        if (ctx == null) { return } // for flowtype lint

        const audioBuffer = _.times(rootComp.audioChannels, () => new Float32Array(new ArrayBuffer(4 /* bytes */ * rootCompWrap.samplingRate)))

        //
        // Resolver
        //
        const resolver: EntityResolver = new EntityResolver(this._project, this._pluginRegistry)

        //
        // make render session / request
        //
        const baseRequest = new RenderRequest({
            destCanvas: bufferCanvas,
            width: rootCompWrap.width,
            height: rootCompWrap.height,
            framerate: rootCompWrap.framerate,
            durationFrames: rootComp.durationFrames,

            destAudioBuffer: audioBuffer,
            audioContext: this._audioContext,
            samplingRate: rootCompWrap.samplingRate,
            neededSamples: rootCompWrap.samplingRate,
            audioChannels: rootCompWrap.audioChannels,

            rootComposition: rootComp,

            resolver: resolver,
        })

        this._playingSession = {
            playing: true,
            baseRequest,
            bufferCanvas,

            preDestinationAudioBuffer: audioBuffer,
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
        endFrame?: number,
        loop?: boolean,
        throttle?: boolean,
        targetCompositionId: string,
    }) : ProgressPromise<any>
    {
        return new ProgressPromise(async (
            resolve: Function,
            reject: Function,
            onAbort: Function,
            notifier: Function,
        ) => {
            const waitNotify = () => new Promise(resolve => setTimeout(resolve))
            let aborted = false
            onAbort(() => aborted = true)

            notifier({state: 'Assertion', finished: 0})
            await waitNotify()

            if (this._project == null) throw new RenderingFailedException(`project must be set before rendering.`)
            if (this._pluginRegistry == null) throw new RenderingFailedException(`pluginRegistry must be set before rendering`)
            if (this._destinationCanvas == null) throw new RenderingFailedException(`destinationCanvas must be set before rendering`)
            if (this._destinationAudioBuffer == null) throw new RenderingFailedException(`destinationAudioBuffer must be set before rendering`)
            if (req.targetCompositionId == null) throw new RenderingFailedException(`rootCompId must be specified.`)

            //
            // Initializing
            //
            if (this._playingSession == null) {
                this.initializePlayingSession(req)
            }

            this._playingSession.playing = true

            notifier({state: 'Initialize renderers', finished: 0})
            await waitNotify()

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

            const {preDestinationAudioBuffer} = session

            const destCanvas = this._destinationCanvas
            const {width: destCanvasWidth, height: destCanvasHeight} = this._destinationCanvas
            const destCanvasCtx = destCanvas.getContext('2d')
            if (destCanvasCtx == null) throw new Error('Failed create Canvas2D context on destination canvas')

            const destinationAudioBuffer = this._destinationAudioBuffer

            const resolver = session.baseRequest.resolver

            //
            // Before rendering
            //
            try {
                notifier({state: 'Initialize plugins', finished: 0})
                await waitNotify()

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
                throw e
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

            let fpsLastCountTime = Date.now()
            let fpsCounter = 0
            let currentFps = 0

            let lastBufferingTime = -1

            notifier({state: 'Rendering started', finished: 0})
            await waitNotify()

            // throttle時にframerate以上のfpsが出てしまうのでMath.ceilで小数点切り上げ分実行間隔を広げる
            const throttleTimeMs = req.throttle ? Math.ceil(1000 / baseRequest.framerate) : 0
            const render = _.throttle(async (): Promise<any> => {
                if (Date.now() - fpsLastCountTime > 1000) {
                    currentFps = fpsCounter
                    fpsCounter = 0
                    fpsLastCountTime = Date.now()
                }

                // const elapsed = (Date.now() - session.renderStartTime) / 1000
                const currentTime = (req.beginFrame + session.renderedFrames) / rootCompContainer.framerate
                const currentTimeForNotify = (Math.round(currentTime * 10) / 10).toFixed(1)
                const isBufferingNeeded = lastBufferingTime !== (currentTime|0) && (session.renderedFrames + 1) <= session.durationFrames
                // console.log(isBufferingNeeded, lastBufferingTime, currentTime);

                const _renderReq = baseRequest.set({
                    // time: elapsed,
                    // frame: elapsed * rootCompWrap.framerate,
                    time: currentTime,
                    frame: req.beginFrame + session.renderedFrames,

                    isBufferingFrame: isBufferingNeeded,
                })

                lastBufferingTime = currentTime|0

                //
                // Clear buffer
                //
                bufferCanvasCtx.clearRect(0, 0, compWidth, compHeight)
                for (let ch = 0, l = rootCompContainer.audioChannels; ch < l; ch++) {
                    preDestinationAudioBuffer[ch].fill(0)
                }

                //
                // Render
                //
                if (aborted) return notifier({state: 'aborted'})
                await rootCompContainer.render(_renderReq)
                if (aborted) return notifier({state: 'aborted'})

                // if (isBufferingNeeded) {
                //     console.log(bufferAudioBuffer === _renderReq.destAudioBuffer);
                //     console.log(bufferAudioBuffer[0])
                //     return
                // }

                //
                // Copy rendered image from buffer
                //
                destCanvasCtx.clearRect(0, 0, destCanvasWidth, destCanvasHeight)
                destCanvasCtx.drawImage(
                    bufferCanvas,
                    0, 0, compWidth, compHeight,
                    0, 0, destCanvasWidth, destCanvasHeight
                )

                if (isBufferingNeeded) {
                    for (let ch = 0, l = rootCompContainer.audioChannels; ch < l; ch++) {
                        destinationAudioBuffer[ch].set(preDestinationAudioBuffer[ch])
                    }
                }

                session.lastRenderedFrame = req.beginFrame + session.renderedFrames

                const currentFrame = (req.beginFrame + session.renderedFrames)
                if (!req.loop && session.renderedFrames >= session.durationFrames) {
                    notifier({
                        state: `Render... time: ${currentTimeForNotify} frames: ${session.renderedFrames} / ${session.durationFrames} (${currentFps} fps${req.throttle ? ' / throttled' : ''})`,
                        isRendering: true,
                        isAudioBuffered: isBufferingNeeded,
                        renderedFrame: session.renderedFrames,
                        finished: 100
                    })

                    notifier({
                        state: `Completed`,
                        isCompleted: true,
                        finished: 100
                    })

                    session.renderedFrames = 0
                    session.playing = false

                    resolve()
                    return
                }

                if (req.loop) {
                    if (req.endFrame != null && currentFrame >= req.endFrame) {
                        session.renderedFrames = 0
                    }
                } else {
                    if (req.endFrame != null && currentFrame >= req.endFrame) {
                        // exit loop
                        session.renderedFrames = 0
                        this.pause()
                        return
                    }
                }

                notifier({
                    state: `Render... time: ${currentTimeForNotify} frames: ${session.renderedFrames} / ${session.durationFrames} (${currentFps} fps${req.throttle ? ' / throttled' : ''})`,
                    isRendering: true,
                    isAudioBuffered: isBufferingNeeded,
                    renderedFrame: session.renderedFrames,
                    finished: session.renderedFrames / session.durationFrames,
                })

                fpsCounter++

                session.renderedFrames++
                if (! this._playingSession.playing) return
                session.animationFrameId = requestAnimationFrame(render)
            }, throttleTimeMs)

            session.animationFrameId = requestAnimationFrame(render)
        })
    }

    export(req: {
        exportPath: string,
        tmpDir: string,
        targetCompositionId: string,
        ffmpegBin: string,
    })
    {
        return new ProgressPromise(async (
            resolve: Function,
            reject: Function,
            onAbort: Function,
            notifier: Function,
        ) => {
            //
            // export via deream
            //
            const rootComp: Composition|null = ProjectHelper.findCompositionById(this._project, req.targetCompositionId)

            if (rootComp == null) {
                throw new RenderingFailedException('Specified composition not in project');
            }

            const durationFrames = rootComp.durationFrames
            const tmpMovieFilePath = path.join(req.tmpDir, 'delir-working.mov')
            const tmpAudioFilePath = path.join(req.tmpDir,'delir-working.wav')

            // const canvas = new NodeCanvas(rootComp.width, rootComp.height)
            const canvas = document.createElement('canvas')
            canvas.width = rootComp.width
            canvas.height = rootComp.height

            const audioBuffer =　_.times(rootComp.audioChannels, () => new Float32Array(new ArrayBuffer(4 /* bytes */ * rootComp.samplingRate)))
            const pcmAudioData = _.times(rootComp.audioChannels, () => new Float32Array(new ArrayBuffer(4 /* bytes */ * rootComp.samplingRate * Math.ceil(durationFrames / rootComp.framerate))))

            const deream = Deream.video({
                args: {
                    'c:v': 'utvideo',
                    // 'b:v': '1024k',
                    // 'pix_fmt': 'yuv420p',
                    // 'r': rootComp.framerate,
                    // 'an': ''
                    // 'f': 'mp4',
                },
                inputFramerate: rootComp.framerate,
                dest: tmpMovieFilePath,
                ffmpegBin: req.ffmpegBin,
            })

            const progPromise = Renderer.render({
                project: this._project,
                pluginRegistry: this._pluginRegistry,
                rootCompId: req.targetCompositionId,
                beginFrame: 0,
                destinationCanvas: canvas,
                destinationAudioBuffers: audioBuffer,
                requestAnimationFrame: window.requestAnimationFrame.bind(window),
            })

            onAbort(() => progPromise.abort())

            let audioDataOffset = 0
            await progPromise.progress(progress => {
                notifier(progress)

                if (progress.isRendering) {
                    deream.write(canvasToBuffer(canvas, 'image/png'))
                }

                if (progress.isAudioBuffered) {
                    for (let ch = 0, l = rootComp.audioChannels; ch < l; ch++) {
                        pcmAudioData[ch].set(audioBuffer[ch], rootComp.samplingRate * audioDataOffset)
                        audioBuffer[ch].fill(0)
                    }

                    audioDataOffset++
                }

                if (progress.isCompleted) {
                    deream.end()
                }
            })

            notifier({state: 'Encoding video/audio'})

            await Promise.all<any>([
                (async () => {
                    const wav = audioBufferToWave({
                        sampleRate: rootComp.samplingRate,
                        numberOfChannels: pcmAudioData.length,
                        getChannelData: ch => pcmAudioData[ch]
                    }, {float32: true})

                    fs.writeFileSync(tmpAudioFilePath, arrayBufferToBuffer(wav))
                })(),
                (async () => {
                    await new Promise(resolve => deream.ffmpeg.on('exit', resolve))
                })(),
            ])

            notifier({state: 'Concat and encoding...'})
            await new Promise((resolve, reject) => {
                const ffmpeg = spawn(req.ffmpegBin, [
                    '-y',
                    // '-f',
                    // 'utvideo',
                    '-i',
                    tmpMovieFilePath,
                    '-i',
                    tmpAudioFilePath,
                    // '-c:a',
                    // 'pcm_f32be',
                    '-c:v',
                    'libx264',
                    '-pix_fmt',
                    'yuv420p',
                    // '-profile:v',
                    // 'baseline',
                    // '-level:v',
                    // '3.1',
                    '-b:v',
                    '1024k',
                    '-profile:a',
                    'aac_low',
                    // '-c:a',
                    // 'libfaac',
                    // '-b:a',
                    // '320k',
                    req.exportPath,
                ])

                let lastMessage: string
                ffmpeg.stderr.on('data', (buffer: Buffer) => { lastMessage = buffer.toString(); console.log(buffer.toString()) })
                ffmpeg.on('exit', (code: number) => code === 0 ? resolve() : reject(new Error(`Failed to mixing (Reason: ${lastMessage})`)))
            })

            notifier({state: 'Rendering completed'})

            try { fs.unlinkSync(tmpMovieFilePath) } catch (e) {}
            try { fs.unlinkSync(tmpAudioFilePath) } catch (e) {}
        })
    }
}
