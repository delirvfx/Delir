import {IRenderer} from './renderer-base'
import Type from '../../plugin-support/type-descriptor'
import {TypeDescriptor} from '../../plugin-support/type-descriptor'
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

    private _audio: any = {}

    public async beforeRender(req: RenderingRequest<AudioRendererParam>)
    {
        const params = req.parameters

        if (this._audio.source === params.source.path) {
            return
        }

        const buffer = await new Promise((resolve, reject) => {
            const fileBuffer = fs.readFileSync(params.source.path)
            const asset = AV.Asset.fromBuffer(fileBuffer)

            asset.on('error', (e: string) => reject(new Error(e)))
            asset.decodeToBuffer(decoded => {
                const numOfChannels: number = asset.format.channelsPerFrame
                const length = (decoded.length / numOfChannels)
                const buffers = []

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
            buffer,
        }
    }

    public async render(req: RenderingRequest<AudioRendererParam>)
    {
        return await this.renderAudio(req)
    }

    public async renderAudio(req: RenderingRequest)
    {
        if (!req.isBufferingFrame) return

        const destBuffers = req.destAudioBuffer
        const begin = (req.seconds|0) * req.samplingRate
        const end = begin + req.neededSamples

        for (let ch = 0, l = req.audioChannels; ch < l; ch++) {
            const buffer = this._audio.buffer[ch]
            destBuffers[ch].set(buffer.slice(begin, end))
        }
    }
}
