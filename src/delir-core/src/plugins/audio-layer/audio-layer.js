// @flow
import type RenderRequest from '../../renderer/render-request'

import Delir from '../../index'
import fs from 'fs'
import av from 'av'
import Speaker from 'speaker'
import {AudioContext} from 'web-audio-api'

export default class AudioLayer extends Delir.PluginBase.CustomLayerPluginBase
{
    static async pluginDidLoad()
    {
        // ✋( ͡° ͜ʖ ͡°) インターフェースに誓って
        if (typeof window === 'undefined') {
            throw new Exceptions.PluginLoadFailException('this plugin only running on Electron')
        }

        // const o = {}
        // o.context = new AudioContext
        // o.context.outStream = new Speaker({
        //     channels: o.context.format.numberOfChannels,
        //     bitDepth: o.context.format.bitDepth,
        //     sampleRate: 48000,
        // })
        //
        //
        //
        //
        //
        //
        //
        //
        //
        // bufferSource.connect(o.context.destination)
        // bufferSource.start(0)
    }

    audio: HTMLAudioElement

    constructor()
    {
        super()
        this.audio = {}
    }

    provideParameter(): {
        [paramId: string]: ParameterTypeDescripter
    }
    {
        return {}
    }

    async beforeRender(preRenderReqest: Object)
    {
        console.log(preRenderReqest)

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

        console.log('decoded', this.audio);
    }

    async render(req: RenderRequest)
    {
        if (!req.isBufferingFrame) return

        const destBuffers = req.destAudioBuffer
        for (const ch = 0, l = req.audioChannels; ch < l; ch++) {
            console.log(req.audioChannels, ch)
            const buffer = this.audio.buffer.getChannelData(ch)
            const begin = (req.seconds *　this.audio.buffer.sampleRate)|0
            const end = begin + req.neededSamples

            destBuffers[ch].set(buffer.slice(begin, end))
        }
    }
}
