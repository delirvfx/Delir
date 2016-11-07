// @flow
import type RenderRequest from '../../renderer/render-request'
import type {TypeDescriptor} from '../../plugin/type-descriptor'

import {Type, LayerPluginBase} from '../../index'
import fs from 'fs'
import av from 'av'
import Speaker from 'speaker'
import {AudioContext} from 'web-audio-api'

export default class AudioLayer extends LayerPluginBase
{
    static async pluginDidLoad()
    {
        // ✋( ͡° ͜ʖ ͡°) インターフェースに誓って
        if (typeof window === 'undefined') {
            throw new Exceptions.PluginLoadFailException('this plugin only running on Electron')
        }
    }

    static provideParameters(): TypeDescriptor
    {
        return Type.asset('source', {
            label: 'Audio file',
            mimeTypes: ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav'],
        })
    }

    audio: any = {}

    constructor()
    {
        super()
        this.audio = {}
    }

    async beforeRender(preRenderReqest: Object)
    {
        this.context = new AudioContext()
        if (this.audio.source !== preRenderReqest.parameters.source) {
            const buffer = await new Promise((resolve, reject) => this.context.decodeAudioData(
                fs.readFileSync(preRenderReqest.parameters.source),
                resolve,
                reject,
            ));

            this.audio = {
                source: preRenderReqest.parameters.source,
                buffer: buffer,
            }
        }
    }

    async render(req: RenderRequest)
    {
        if (!req.isBufferingFrame) return

        console.info('put buffer');
        const destBuffers = req.destAudioBuffer
        const begin = (req.seconds|0) * req.samplingRate
        const end = begin + req.neededSamples
        console.log(begin, end);

        for (const ch = 0, l = req.audioChannels; ch < l; ch++) {
            const buffer = this.audio.buffer.getChannelData(ch)
            destBuffers[ch].set(buffer.slice(begin, end))
        }
    }
}
