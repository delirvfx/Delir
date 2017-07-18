import * as _ from 'lodash'

import {IRenderer} from './renderer-base'
import Type from '../../plugin-support/type-descriptor'
import {TypeDescriptor} from '../../plugin-support/type-descriptor'
import PreRenderingRequest from '../pipeline/pre-rendering-request'
import RenderingRequest from '../pipeline/render-request'

import Asset from '../../project/asset'

import * as fs from 'fs'
import AV from 'av'
import 'mp3'
import 'flac'
import 'alac'
import 'aac'

interface AudioRendererParam {
    source: Asset
    volume: number
}

const resampling = async (sourceSamplingRate: number, destSamplingRate: number, inputs: Float32Array[]|AudioBuffer, length?: number): Promise<Float32Array[]> => {
    const chs = Array.isArray(inputs) ? inputs.length : inputs.numberOfChannels
    length = length == null ? (Array.isArray(inputs) ? inputs[0].length : inputs.length) : length

    const context = new OfflineAudioContext(chs, length, destSamplingRate)
    const inputBuffer = context.createBuffer(chs, length, sourceSamplingRate)
    _.times(chs, ch => { inputBuffer.copyToChannel(inputs[ch], ch) })

    const bufferSource = context.createBufferSource()
    bufferSource.buffer = inputBuffer
    bufferSource.connect(context.destination)
    bufferSource.start(0)

    const result = await context.startRendering()
    return _.times(chs, ch => result.getChannelData(ch))
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
    }

    private _audio: {
        source: string
        format: {
            bitrate: number
            channelPerFrame: number
            floatingPoint: boolean
            formatID: string,
            sampleRate: number
        }
        buffers: Float32Array[]
    }

    public async beforeRender(req: PreRenderingRequest<AudioRendererParam>)
    {
        const params = req.parameters

        if ((this._audio || {} as any).source === params.source.path) {
            return
        }

        let format
        const buffers = await new Promise<Float32Array[]>((resolve, reject) => {
            const fileBuffer = fs.readFileSync(params.source.path)
            const asset = AV.Asset.fromBuffer(fileBuffer)

            asset.on('error', (e: string) => reject(new Error(e)))
            asset.decodeToBuffer(decoded => {
                format = asset.format
                const numOfChannels: number = asset.format.channelsPerFrame
                const length = (decoded.length / numOfChannels)
                const buffers: Float32Array[] = []

                for (let ch = 0; ch < numOfChannels; ch++) {
                    const chBuffer: Float32Array = new Float32Array(length)

                    for (let i = 0; i < length; i++) {
                        chBuffer[i] = decoded[ch + i * numOfChannels]
                    }

                    buffers.push(chBuffer)
                }

                resolve(buffers)
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
        return await this.renderAudio(req)
    }

    public async renderAudio(req: RenderingRequest<AudioRendererParam>)
    {
        if (!req.isAudioBufferingNeeded) return

        const volume = req.parameters.volume / 100
        const destBuffers = req.destAudioBuffer
        const begin = (req.seconds|0) * req.samplingRate
        const end = begin + req.neededSamples

        const slices: Float32Array[] = new Array(req.audioChannels)

        for (let ch = 0, l = req.audioChannels; ch < l; ch++) {
            const buffer = this._audio.buffers[ch]
            slices[ch] = buffer.slice(begin, end)
        }

        const resampled = await resampling(
            this._audio.format.sampleRate,
            req.samplingRate,
            slices,
            req.neededSamples
        )

        resampled.forEach((buffer, ch) => {
            for (let idx = 0, l = buffer.length; idx < l; idx++) {
                buffer[idx] = buffer[idx] * volume
            }

            destBuffers[ch] = buffer
        })
    }
}
