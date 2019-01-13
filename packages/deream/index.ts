import arrayBufferToBuffer = require('arraybuffer-to-buffer')
import audioBufferToWave = require('audiobuffer-to-wav')
import { spawn } from 'child_process'
import { nativeImage } from 'electron'
import * as fs from 'mz/fs'
import * as path from 'path'

import * as Delir from '@ragg/delir-core'

// import PromiseQueue from './utils/PromiseQueue'
import * as Exporter from './exporter'

export enum RenderingStep {
    Started = 'started',
    Rendering = 'rendering',
    Encoding = 'encoding',
    Concat = 'concat',
    Completed = 'completed',
}

export interface RenderingProgress {
    step: RenderingStep
    /** number of 0 to 1 */
    progression: number
}

interface ExportOptions {
    project: Delir.Entity.Project
    rootCompId: string
    temporaryDir: string
    exportPath: string
    pluginRegistry: Delir.PluginRegistry
    ignoreMissingEffect?: boolean
    onProgress?: (progress: RenderingProgress) => void
    ffmpegBin?: string
}

export default async (options: ExportOptions): Promise<void> => {
    const { project, rootCompId, temporaryDir, exportPath, pluginRegistry, ffmpegBin } = options
    const onProgress = options.onProgress || (() => {})

    //
    // export via dereamp
    //
    onProgress({ step: RenderingStep.Started, progression: 0 })

    const comp = project.findComposition(rootCompId)

    if (comp == null) {
        throw new Error('Project not contains specified composition')
    }

    const durationFrames = comp.durationFrames

    const tmpMovieFilePath = path.join(temporaryDir, 'delir-working.mov')
    const tmpAudioFilePath = path.join(temporaryDir, 'delir-working.wav')

    let audioDataOffset = 0
    const pcmAudioData = Array.from(Array(comp.audioChannels)).map(
        () =>
            new Float32Array(
                new ArrayBuffer(4 /* bytes */ * comp.samplingRate * Math.ceil(durationFrames / comp.framerate)),
            ),
    )

    const exporter = Exporter.video({
        args: {
            'c:v': 'utvideo',
            // 'b:v': '1024k',
            // 'pix_fmt': 'yuv420p',
            // 'r': rootComp.framerate,
            // 'an': ''
            // 'f': 'mp4',
        },
        inputFramerate: comp.framerate,
        dest: tmpMovieFilePath,
        ffmpegBin: ffmpegBin || 'ffmpeg',
    })

    // const progPromise = Renderer.render({
    //     project: this._project,
    //     pluginRegistry: this._pluginRegistry,
    //     rootCompId: req.targetCompositionId,
    //     beginFrame: 0,
    //     destinationCanvas: canvas,
    //     destinationAudioBuffers: audioBuffer,
    //     requestAnimationFrame: window.requestAnimationFrame.bind(window),
    // })

    // const queue = new PromiseQueue()

    const pipeline = new Delir.Engine.Engine()
    pipeline.setProject(project)
    pipeline.pluginRegistry = pluginRegistry

    pipeline.setStreamObserver({
        onFrame: (canvas, status) => {
            // toBlob() を使うと 4-10ms くらいで１フレームを書き出せるけど
            // 処理が非同期になってしまってフレーム順序が守れなくなるのであとからいい感じにしたい
            // queue.add(async () => {
            //     const buffer = await new Promise<Buffer>(resolve => {
            //         canvas.toBlob(result => {
            //             const reader = new FileReader()
            //             reader.onload = e => resolve(Buffer.from(reader.result as ArrayBuffer))
            //             reader.readAsArrayBuffer(result)
            //         }, 'image/png')
            //     })

            //     await new Promise(resolve => exporter.write(buffer, resolve))
            // })

            const png = nativeImage.createFromDataURL(canvas.toDataURL('image/png'))
            exporter.write(png.toPNG())
        },
        onAudioBuffered: buffers => {
            for (let ch = 0, l = comp.audioChannels; ch < l; ch++) {
                pcmAudioData[ch].set(buffers[ch], comp.samplingRate * audioDataOffset)
            }

            audioDataOffset++
        },
        onStateChanged: state => {
            const progression = state.frame / state.durationFrame
            onProgress({ step: RenderingStep.Rendering, progression })
        },
    })

    // queue.run()
    await pipeline.renderSequencial(rootCompId, {
        loop: false,
        ignoreMissingEffect: options.ignoreMissingEffect,
        realtime: false,
        audioBufferSizeSecond: 1,
    })
    // await queue.waitEmpty()

    // queue.stop()
    exporter.end()

    onProgress({ step: RenderingStep.Encoding, progression: 0 })

    await Promise.all<any>([
        (async () => {
            const wav = audioBufferToWave(
                {
                    sampleRate: comp.samplingRate,
                    numberOfChannels: pcmAudioData.length,
                    getChannelData: ch => pcmAudioData[ch],
                },
                { float32: true },
            )

            return fs.writeFile(tmpAudioFilePath, arrayBufferToBuffer(wav))
        })(),
        (async () => {
            await new Promise(resolve => exporter.ffmpeg.on('exit', resolve))
        })(),
    ])

    onProgress({ step: RenderingStep.Concat, progression: 0 })

    await new Promise((resolve, reject) => {
        const ffmpeg = spawn(ffmpegBin || 'ffmpeg', [
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
            exportPath,
        ])

        let lastMessage: string
        ffmpeg.stderr.on('data', (buffer: Buffer) => {
            lastMessage = buffer.toString()
            // tslint:disable-next-line
            console.log(buffer.toString())
        })
        ffmpeg.on('exit', (code: number) =>
            code === 0 ? resolve() : reject(new Error(`Failed to mixing (Reason: ${lastMessage})`)),
        )
    })

    onProgress({ step: RenderingStep.Completed, progression: 100 })

    try {
        fs.unlinkSync(tmpMovieFilePath)
    } catch (e) {}
    try {
        fs.unlinkSync(tmpAudioFilePath)
    } catch (e) {}
}
