
import type RenderRequest from '../../renderer/render-request'

import _ from 'lodash'
import Delir from '../../index'
import T from '../../plugin/parameter-types'
import {Exceptions} from '../../exceptions/index'

export default class HTML5VideoLayer extends Delir.PluginBase.CustomLayerPluginBase
{
    static async pluginDidLoad()
    {
        // ✋( ͡° ͜ʖ ͡°) インターフェースに誓って
        if (typeof window === 'undefined') {
            throw new Exceptions.PluginLoadFailException('this plugin only running on Electron')
        }
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

    onParameterChanged(newParam: Object, oldParam: Object)
    {
        if (newParam.sourceFile !== oldParam.sourceFile) {
            this.video.src = newParam.sourceFile.path
        }
    }

    async beforeRender(preRenderReqest: Object)
    {
        console.log(preRenderReqest.parameters.source)
        this.video.src = preRenderReqest.parameters.source
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
        ctx.drawImage(this.video, 0, 0)
    }

    //
    // Editor handling methods
    //

    provideParameter(): Object
    {
        return {
            'sourceFile': T(T.asset, {
                enabled: true,
                label: 'Source',
            })
        }
    }

    // MEMO: キャッシュが必要な（例えば音声ファイルなど）パラメータの変更を検知するためのAPI
    // onDidParameterChanged(newParam, oldParam)
    // {
    //
    // }
}
