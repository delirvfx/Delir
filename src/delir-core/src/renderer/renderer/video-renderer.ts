import {IRenderer} from './renderer-base'
import Type from '../../plugin-support/type-descriptor'
import {TypeDescriptor} from '../../plugin-support/type-descriptor'
import PreRenderingRequest from '../pipeline/pre-render-request'
import RenderingRequest from '../pipeline/render-request'

import Asset from '../../project/asset'

interface VideoRendererParam {
    source: Asset
    loop: boolean
    offsetTime: number
    x: number
    y: number
    scale: number
    rotate: number
}

export default class VideoLayer implements IRenderer<VideoRendererParam>
{
    public static get rendererId(): string { return 'video' }

    public static provideAssetAssignMap()
    {
        return {
            mp4: 'source',
        }
    }

    public static provideParameters(): TypeDescriptor
    {
        return Type
            .asset('source', {
                label: 'Movie file',
                extensions: ['mp4'],
            })
            .number('offsetTime', {
                label: 'Start time',
                animatable: false,
                defaultValue: 0,
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
            .float('scale', {
                label: 'Scale',
                animatable: true,
                defaultValue: 1,
            })
            .float('rotate', {
                label: 'Rotation',
                animatable: true,
                defaultValue: 0,
            })
    }

    private _video: HTMLVideoElement

    public async beforeRender(req: PreRenderingRequest<VideoRendererParam>)
    {
        const parameters = req.parameters as any

        this._video = document.createElement('video')
        this._video.src = `file://${parameters.source.path}`
        this._video.loop = parameters.loop
        this._video.load()
        this._video.currentTime = -1

        await new Promise((resolve, reject) => {
            const onLoaded = () => {
                resolve()
                this._video.removeEventListener('error', onError, false)
            }

            const onError = () => {
                reject(new Error('video not found'))
                this._video.removeEventListener('loadeddata', onLoaded, false)
            }

            this._video.addEventListener('loadeddata', onLoaded, {once: true, capture: false} as any)
            this._video.addEventListener('error', onError, {once: true, capture: false}  as any)
        })
    }

    public async render(req:  RenderingRequest<VideoRendererParam>)
    {
        const param = req.parameters
        const ctx = req.destCanvas.getContext('2d')!
        const video = this._video

        await new Promise((resolve, reject) => {
            const waiter = (e: Event) => resolve()
            video.addEventListener('seeked', waiter, {once: true} as any)
            setTimeout(waiter, 1000)

            const time = param.offsetTime +  req.timeOnClip
            video.currentTime = param.loop ? time % video.duration : time
        })

        const rad = param.rotate * Math.PI / 180

        ctx.translate(param.x, param.y)
        ctx.scale(param.scale, param.scale)
        ctx.translate(video.videoWidth / 2, video.videoHeight / 2)
        ctx.rotate(rad)
        ctx.translate(-video.videoWidth / 2, -video.videoHeight / 2)

        ctx.drawImage(this._video, 0, 0)
    }
}
