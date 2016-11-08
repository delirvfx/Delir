
import type RenderRequest from '../../renderer/render-request'

import _ from 'lodash'
import {Type, LayerPluginBase} from '../../index'
import T from '../../plugin/type-descriptor'
import {Exceptions} from '../../exceptions/index'

export default class HTML5VideoLayer extends LayerPluginBase
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
        return Type
            .asset('source', {
                label: 'Movie file',
                mimeTypes: ['movie/mp4'],
            })
            .bool('loop', {
                label: 'Loop',
                animatable: false,
            })
            .number('x', {
                label: 'Position X',
                animatable: true,
            })
            .number('y', {
                label: 'Position Y',
                animatable: true,
            })
    }

    video: HTMLVideoElement

    constructor()
    {
        super()
        const v = this.video = document.createElement('video')
        // document.body.appendChild(this.video)
        // Object.assign(v.style, {
        //     position: 'fixed',
        //     top: '0px',
        //     left: '0px',
        // })
    }

    // onParameterChanged(newParam: Object, oldParam: Object)
    // {
    //     if (newParam.sourceFile !== oldParam.sourceFile) {
    //         this.video.src = newParam.sourceFile.path
    //     }
    // }

    async beforeRender(preRenderRequest: Object)
    {
        const {parameters} = preRenderRequest
        this.video.src = `file://${parameters.source.path}`
        this.video.loop = parameters.loop
        this.video.load()
        this.video.currentTime = -1

        // console.log(this.video);
        await new Promise(resolve => {
            this.video.addEventListener('loadeddata', () => resolve())
        })
    }

    async render(req: RenderRequest)
    {
        // req.frame
        const ctx = req.destCanvas.getContext('2d')

        // frame to time mapping
        // const sourceFps = 30 // Math.ceil(this.video.webkitDecodedFrameCount / this.video.duration)
        // const time = req.timeOnLayer * sourceFps
        //
        // console.dir(req.timeOnLayer * sourceFps);
        // console.log(time, req);

        // console.log('wait seek');
        // this.video.play()
        // this.video.pause()

        await new Promise((resolve, reject) => {
            const waiter = e => {
                resolve()
                this.video.removeEventListener('seeked', waiter)
            }

            this.video.addEventListener('seeked', waiter)
            // this.video.addEventListener('loadeddata', )
            this.video.currentTime = req.timeOnLayer
            setTimeout(waiter, 1000)
        })
        // console.log('seeked');

        if (ctx == null) { return }
        console.log(req.parameters);
        ctx.drawImage(this.video, req.parameters.x, req.parameters.y)
    }

    //
    // Editor handling methods
    //

    // MEMO: キャッシュが必要な（例えば音声ファイルなど）パラメータの変更を検知するためのAPI
    // onDidParameterChanged(newParam, oldParam)
    // {
    //
    // }
}
