import times from 'lodash.times'
import * as path from 'path'
import * as fs from 'mz/fs'
import {spawn} from 'child_process'
import canvasToBuffer from 'electron-canvas-to-buffer'
import audioBufferToWave from 'audiobuffer-to-wav'
import arrayBufferToBuffer from 'arraybuffer-to-buffer'

import * as Delir from 'delir-core'
import {ProjectHelper} from 'delir-core'

// import PromiseQueue from './utils/PromiseQueue'
import * as Exporter from './exporter'

interface ExportOptions {
    project: Delir.Project.Project
    rootCompId: string
    temporaryDir: string
    exportPath: string
    pluginRegistry: Delir.PluginRegistry
    onProgress?: (progress: {state: string}) => void
    ffmpegBin?: string
}

export default async (
    options: ExportOptions
): Promise<void> => {
    const {project, rootCompId, temporaryDir, exportPath, pluginRegistry, onProgress, ffmpegBin} = options

    //
    // export via deream
    //
    onProgress({state: 'Rendering started'})

    const comp = ProjectHelper.findCompositionById(project, rootCompId)

    if (comp == null) {
        throw new Error('Project not contains specified composition')
    }

    const durationFrames = comp.durationFrames

    const tmpMovieFilePath = path.join(temporaryDir, 'delir-working.mov')
    const tmpAudioFilePath = path.join(temporaryDir,'delir-working.wav')

    let audioDataOffset = 0
    const pcmAudioData = times(comp.audioChannels, () => new Float32Array(new ArrayBuffer(4 /* bytes */ * comp.samplingRate * Math.ceil(durationFrames / comp.framerate))))

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

    const pipeline = new Delir.Engine.Pipeline()
    pipeline.project = project
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
            exporter.write(canvasToBuffer(canvas))
        },
        onAudioBuffered: buffers => {
            for (let ch = 0, l = comp.audioChannels; ch < l; ch++) {
                pcmAudioData[ch].set(buffers[ch], comp.samplingRate * audioDataOffset)
            }

            audioDataOffset++
        },
        onStateChanged: state => {
            const progression =  Math.floor((state.frame / state.durationFrame) * 100)
            onProgress({state: `Rendering: ${progression}% `})
        }
    })

    // queue.run()
    await pipeline.renderSequencial(rootCompId, {loop: false})
    // await queue.waitEmpty()

    // queue.stop()
    exporter.end()

    onProgress({state: 'Encoding video/audio'})

    await Promise.all<any>([
        (async () => {
            const wav = audioBufferToWave({
                sampleRate: comp.samplingRate,
                numberOfChannels: pcmAudioData.length,
                getChannelData: ch => pcmAudioData[ch]
            }, {float32: true})

            return fs.writeFile(tmpAudioFilePath, arrayBufferToBuffer(wav))
        })(),
        (async () => {
            await new Promise(resolve => exporter.ffmpeg.on('exit', resolve))
        })(),
    ])

    onProgress({state: 'Concat and encoding...'})
    await new Promise((resolve, reject) => {
        const ffmpeg = spawn(ffmpegBin, [
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
        ffmpeg.stderr.on('data', (buffer: Buffer) => { lastMessage = buffer.toString(); console.log(buffer.toString()) })
        ffmpeg.on('exit', (code: number) => code === 0 ? resolve() : reject(new Error(`Failed to mixing (Reason: ${lastMessage})`)))
    })

    onProgress({state: 'Rendering completed'})

    try { fs.unlinkSync(tmpMovieFilePath) } catch (e) {}
    try { fs.unlinkSync(tmpAudioFilePath) } catch (e) {}
}
