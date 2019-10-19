import _ from 'lodash'

import { resampling } from '../../../helper/Audio'
import Type from '../../../PluginSupport/TypeDescriptor'
import { TypeDescriptor } from '../../../PluginSupport/TypeDescriptor'
import { ParamType } from '../../ParamType'
import { IRenderer } from '../RendererBase'

import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'

interface AudioRendererParam {
  source: ParamType.Asset
  volume: ParamType.Float
  startTime: ParamType.Float
}

export class AudioRenderer implements IRenderer<AudioRendererParam> {
  public static get rendererId(): string {
    return 'audio'
  }

  public static provideAssetAssignMap() {
    return {
      wav: 'source',
      webm: 'source',
      mpeg: 'source',
      mp3: 'source',
      ogg: 'source',
    }
  }

  public static provideParameters(): TypeDescriptor {
    return Type.asset('source', {
      label: 'Audio file',
      extensions: ['wav', 'webm', 'mpeg', 'mp3', 'ogg'],
    })
      .float('volume', {
        label: 'Volume',
        defaultValue: () => 100,
        animatable: true,
      })
      .float('startTime', {
        label: 'Start time(sec)',
        animatable: false,
        defaultValue: () => 0,
      })
  }

  private audio: {
    sourcePath: string
    numberOfChannels: number
    buffers: Float32Array[]
  } | null

  public async beforeRender(context: ClipPreRenderContext<AudioRendererParam>) {
    const params = context.parameters

    if (!params.source) {
      this.audio = null
      return
    }

    if (this.audio && this.audio.sourcePath === params.source.path) {
      return
    }

    // `AudioContext` cause depletion, use OfflineAudioContext
    const audioCtx = new OfflineAudioContext(1, context.audioChannels, context.samplingRate)
    const content = await (await fetch(params.source.path)).arrayBuffer()
    const audioBuffer = await audioCtx.decodeAudioData(content)
    const buffers = _.times(audioBuffer.numberOfChannels, ch => audioBuffer.getChannelData(ch))

    await resampling(audioBuffer.sampleRate, context.samplingRate, buffers)

    this.audio = {
      sourcePath: params.source.path,
      numberOfChannels: audioBuffer.numberOfChannels,
      buffers,
    }
  }

  public async render(context: ClipRenderContext<AudioRendererParam>) {
    return this.renderAudio(context)
  }

  public async renderAudio(context: ClipRenderContext<AudioRendererParam>) {
    if (!context.isAudioBufferingNeeded) return
    if (!this.audio) return

    const volume = _.clamp(context.parameters.volume / 100, 0, 1)

    const source = this.audio
    const destBuffers = context.destAudioBuffer

    // Placement offset
    const isClipHead = context.timeOnClip <= 0
    const bufferSizeTime = context.neededSamples / context.samplingRate
    const offsetTimeInBuffer = (context.clip.placedFrame / context.framerate) % bufferSizeTime
    const startInBufferOffsetSamples = Math.floor(offsetTimeInBuffer * context.samplingRate)

    // Cutting position
    const clipEndTime = (context.clip.placedFrame + context.clip.durationFrames) / context.framerate
    const isClipEnd = clipEndTime < context.timeOnComposition + bufferSizeTime
    const clipEndTimeInBuffer = clipEndTime % bufferSizeTime
    const clipEndPosSamples = Math.floor(clipEndTimeInBuffer * context.samplingRate)

    // Slice position
    const startTimeSamples = Math.max(0, context.parameters.startTime) * context.samplingRate
    const elapsedSamples = Math.round(context.timeOnClip * context.samplingRate)

    // Slice from source
    // (Rewind by amount of bufferOffsetSamples)
    const begin = Math.floor(startTimeSamples + elapsedSamples - startInBufferOffsetSamples)
    const end = begin + context.neededSamples

    const slices: Float32Array[] = []

    for (let ch = 0, l = source.numberOfChannels; ch < l; ch++) {
      const buffer = source.buffers[ch]

      if (begin < 0) {
        slices[ch] = new Float32Array(context.neededSamples)
        slices[ch].set(buffer.slice(Math.max(0, begin), end), startInBufferOffsetSamples)
      } else {
        slices[ch] = buffer.slice(begin, end)
      }

      if (isClipHead) {
        slices[ch] = slices[ch].fill(0, 0, startInBufferOffsetSamples) // Fill rewinded samples
      }

      if (isClipEnd) {
        slices[ch].fill(0, clipEndPosSamples)
      }
    }

    // Resampling & gaining
    const audioCtx = new OfflineAudioContext(context.audioChannels, context.neededSamples, context.samplingRate)

    const inputBuffer = audioCtx.createBuffer(source.numberOfChannels, context.neededSamples, context.samplingRate)
    _.times(source.numberOfChannels, ch => inputBuffer.copyToChannel(slices[ch], ch))

    const gain = audioCtx.createGain()
    gain.gain.value = volume
    gain.connect(audioCtx.destination)

    const bufferSource = audioCtx.createBufferSource()
    bufferSource.buffer = inputBuffer
    bufferSource.connect(gain)
    bufferSource.start(0)

    const result = await audioCtx.startRendering()
    _.times(context.audioChannels, ch => destBuffers[ch].set(result.getChannelData(ch)))
  }
}
