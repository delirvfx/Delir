import * as _ from 'lodash'

import { resampling } from '../../../helper/Audio'
import Type from '../../../plugin-support/type-descriptor'
import { TypeDescriptor } from '../../../plugin-support/type-descriptor'
import PreRenderingRequest from '../../PreRenderingRequest'
import RenderingRequest from '../../RenderRequest'
import { IRenderer } from '../RendererBase'

import Asset from '../../../project/asset'

import 'aac'
import 'alac/src/decoder'
import * as AV from 'av/node'
import 'flac'
import * as fs from 'fs'
import 'mp3'

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
        source: string
        format: AVFormat
        buffers: Float32Array[]
    }

    public async beforeRender(req: PreRenderingRequest<AudioRendererParam>)
    {
        const params = req.parameters

        if ((this._audio || {} as any).source === params.source.path) {
            return
        }

        const {buffers, format} = await new Promise<{buffers: Float32Array[], format: AVFormat}>((resolve, reject) => {
            const fileBuffer = fs.readFileSync(params.source.path)
            const asset = AV.Asset.fromBuffer(fileBuffer)

            asset.on('error', (e: string) => reject(new Error(e)))
            asset.decodeToBuffer(async (decoded: Float32Array) => {
                const numOfChannels: number = asset.format.channelsPerFrame
                const length = (decoded.length / numOfChannels)
                let buffers: Float32Array[] = []

                for (let ch = 0; ch < numOfChannels; ch++) {
                    const chBuffer: Float32Array = new Float32Array(length)

                    for (let i = 0; i < length; i++) {
                        chBuffer[i] = decoded[ch + i * numOfChannels]
                    }

                    buffers.push(chBuffer)
                }

                buffers = await resampling(format.sampleRate, req.samplingRate, buffers)

                resolve({buffers, format: asset.format})
            })
        })

        this._audio = {
            source: params.source.path,
            format,
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

        for (let ch = 0, l = source.format.channelsPerFrame; ch < l; ch++) {
            const buffer = source.buffers[ch]
            slices[ch] = buffer.slice(begin, end)
        }

        // Resampling & gaining
        const context = new OfflineAudioContext(req.audioChannels, req.neededSamples, req.samplingRate)

        const inputBuffer = context.createBuffer(source.format.channelsPerFrame, req.neededSamples, req.samplingRate)
        _.times(source.format.channelsPerFrame, ch => inputBuffer.copyToChannel(slices[ch], ch))

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
