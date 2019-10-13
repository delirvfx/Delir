import * as Delir from '@delirvfx/core'
import arrayBufferToBuffer = require('arraybuffer-to-buffer')
import audioBufferToWave = require('audiobuffer-to-wav')
import { spawn } from 'child_process'
import duplexer3 from 'duplexer3'
import { nativeImage } from 'electron'
import fs from 'mz/fs'
import path from 'path'

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

export enum VCodecs {
  libx264 = 'libx264',
  libx265 = 'libx265',
  utvideo = 'utvideo',
}

export enum ACodecs {
  aacLow = 'aac_low',
  pcm = 'pcm',
}

export interface EncodingOption {
  vCodec: VCodecs
  vBitrate: string | null
  aCodec: ACodecs
  aBitrate: string | null
  useAlpha: boolean
}

interface ExportOptions {
  project: Delir.Entity.Project
  rootCompId: string
  temporaryDir: string
  exportPath: string
  pluginRegistry: Delir.PluginRegistry
  encoding: EncodingOption
  ignoreMissingEffect?: boolean
  onProgress?: (progress: RenderingProgress) => void
  ffmpegBin?: string
}

const optionToFfmpegArgs = (option: EncodingOption & { videoInput: string; audioInput: string; destPath: string }) => {
  return [
    '-y',
    '-i',
    option.videoInput,
    '-i',
    option.audioInput,
    '-c:v',
    option.vCodec,
    '-b:v',
    option.vBitrate ?? '1024k',
    '-pix_fmt',
    option.useAlpha ? 'rgba' : 'yuv420p',
    ...(option.aCodec === ACodecs.aacLow ? ['-profile:a', 'aac_low', '-c:a', 'aac'] : []),
    '-b:a',
    option.aBitrate ? option.aBitrate : '256k',
    option.destPath,
  ]
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
      new Float32Array(new ArrayBuffer(4 /* bytes */ * comp.samplingRate * Math.ceil(durationFrames / comp.framerate))),
  )

  const sourceFFmpegProcess = spawn(ffmpegBin || 'ffmpeg', [
    '-y',
    '-framerate',
    `${comp.framerate}`,
    '-i',
    'pipe:0',
    '-c:v',
    'png_pipe',
    '-c:v',
    'utvideo',
    '-pix_fmt',
    'rgba',
    // 'yuva420p',
    tmpMovieFilePath
  ])

  // tslint:disable-next-line:no-console
  sourceFFmpegProcess.stderr.on('data', chunk => console.log('ffmpeg:', chunk.toString()))

  const sourceFFmpegStream = duplexer3(sourceFFmpegProcess.stdin, sourceFFmpegProcess.stdout)

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
      sourceFFmpegStream.write(png.toPNG())
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
    enableAlpha: options.encoding.useAlpha,
    realtime: false,
    audioBufferSizeSecond: 1,
  })
  // await queue.waitEmpty()

  // queue.stop()
  sourceFFmpegStream.end()

  onProgress({ step: RenderingStep.Encoding, progression: 0 })

  await Promise.all<any>([
    (async () => {
      const wav = audioBufferToWave(
        {
          sampleRate: comp.samplingRate,
          numberOfChannels: pcmAudioData.length,
          getChannelData: (ch: number) => pcmAudioData[ch],
        } as any,
        { float32: true },
      )

      return fs.writeFile(tmpAudioFilePath, arrayBufferToBuffer(wav))
    })(),
    (async () => {
      await new Promise(resolve => {
        if ((sourceFFmpegProcess as any).exitCode != null) {
          resolve()
        } else {
          sourceFFmpegProcess.on('exit', resolve)
        }
      })
    })(),
  ])

  onProgress({ step: RenderingStep.Concat, progression: 0 })

  await new Promise((resolve, reject) => {
    const args = optionToFfmpegArgs({
      ...options.encoding,
      videoInput: tmpMovieFilePath,
      audioInput: tmpAudioFilePath,
      destPath: exportPath,
    })

    // tslint:disable-next-line
    console.info(`🤜🤛 Mixing started with \`ffmpeg ${args.join(' ')}\``)

    const ffmpeg = spawn(ffmpegBin || 'ffmpeg', args)

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
