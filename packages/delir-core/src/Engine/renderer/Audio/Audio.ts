import * as fs from 'fs'
import * as _ from 'lodash'

import { resampling } from '../../../helper/Audio'
import Type from '../../../PluginSupport/type-descriptor'
import { TypeDescriptor } from '../../../PluginSupport/type-descriptor'
import PreRenderContext from '../../PreRenderContext'
import RenderingRequest from '../../RenderContext'
import { IRenderer } from '../RendererBase'

import { Asset } from '../../../Entity'

interface AVFormat {
    bitrate: number
    channelsPerFrame: number
    floatingPoint: boolean
    formatID: string,
    sampleRate: number
}

interface AudioRendererParam {
    source: Asset
    volume: number
    startTime: number
}

export default class AudioRenderer implements IRenderer<AudioRendererParam>
{
    public static get rendererId(): string { return 'audio' }

    public static provideAssetAssignMap()
    {
        return {
            wav: 'source',
            webm: 'source',
            mpeg: 'source',
            mp3: 'source',
            ogg: 'source'
        }
    }

    public static provideParameters(): TypeDescriptor
    {
        return Type
            .asset('source', {
                label: 'Audio file',
                extensions: ['wav', 'webm', 'mpeg', 'mp3', 'ogg'],
            })
            .float('volume', {
                label: 'Volume',
                defaultValue: 100,
                animatable: true,
            })
            .float('startTime', {
                label: 'Start time(sec)',
                animatable: false,
                defaultValue: 0,
            })
    }

    private _audio: {
        sourcePath: string
        numberOfChannels: number
        buffers: Float32Array[]
    }

    public async beforeRender(req: PreRenderContext<AudioRendererParam>)
    {
        const params = req.parameters

        if (this._audio && this._audio.sourcePath === params.source.path) {
            return
        }

        // `AudioContext` cause depletion, use OfflineAudioContext
        const context = new OfflineAudioContext(1, req.audioChannels, req.samplingRate)
        const content = fs.readFileSync(params.source.path)
        const audioBuffer = await context.decodeAudioData(content.buffer as ArrayBuffer)
        const buffers = _.times(audioBuffer.numberOfChannels, ch => audioBuffer.getChannelData(ch))

        await resampling(audioBuffer.sampleRate, req.samplingRate, buffers)

        this._audio = {
            sourcePath: params.source.path,
            numberOfChannels: audioBuffer.numberOfChannels,
            buffers,
        }
    }

    public async render(req: RenderingRequest<AudioRendererParam>)
    {
        return this.renderAudio(req)
    }

    public async renderAudio(req: RenderingRequest<AudioRendererParam>)
    {
        if (!req.isAudioBufferingNeeded) return

        const volume = _.clamp(req.parameters.volume / 100, 0, 1)

        const source = this._audio
        const destBuffers = req.destAudioBuffer

        // Slice from source
        const begin = ((req.parameters.startTime * req.samplingRate) + (req.timeOnClip * req.samplingRate)) | 0
        const end = begin + req.neededSamples

        const slices: Float32Array[] = new Array(req.audioChannels)

        for (let ch = 0, l = source.numberOfChannels; ch < l; ch++) {
            const buffer = source.buffers[ch]
            slices[ch] = buffer.slice(begin, end)
        }

        // Resampling & gaining
        const context = new OfflineAudioContext(req.audioChannels, req.neededSamples, req.samplingRate)

        const inputBuffer = context.createBuffer(source.numberOfChannels, req.neededSamples, req.samplingRate)
        _.times(source.numberOfChannels, ch => inputBuffer.copyToChannel(slices[ch], ch))

        const gain = context.createGain()
        gain.gain.value = volume
        gain.connect(context.destination)

        const bufferSource = context.createBufferSource()
        bufferSource.buffer = inputBuffer
        bufferSource.connect(gain)
        bufferSource.start(0)

        const result = await context.startRendering()
        _.times(req.audioChannels, ch => destBuffers[ch].set(result.getChannelData(ch)))
    }
}
