import * as _ from 'lodash'

import Type from '../../../PluginSupport/type-descriptor'
import { TypeDescriptor } from '../../../PluginSupport/type-descriptor'
import PreRenderContext from '../../PreRenderContext'
import RenderingRequest from '../../RenderContext'
import { IRenderer } from '../RendererBase'

import { Asset } from '../../../Entity'

interface VideoRendererParam {
    source: Asset
    loop: boolean
    offsetTime: number
    x: number
    y: number
    scale: number
    rotate: number
    opacity: number
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
                defaultValue: 100,
            })
            .float('rotate', {
                label: 'Rotation',
                animatable: true,
                defaultValue: 0,
            })
            .float('opacity', {
                label: 'Opacity',
                animatable: true,
                defaultValue: 100,
            })
    }

    private _video: HTMLVideoElement

    public async beforeRender(req: PreRenderContext<VideoRendererParam>)
    {
        const parameters = req.parameters as any

        if (req.parameters.source == null) {
            return
        }

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

    public async render(req: RenderingRequest<VideoRendererParam>)
    {
        if (!req.parameters.source) {
            return
        }

        const param = req.parameters
        const ctx = req.destCanvas.getContext('2d')!
        const video = this._video

        await new Promise((resolve, reject) => {
            const waiter = (e: Event) => resolve()
            video.addEventListener('seeked', waiter, {once: true} as any)
            setTimeout(waiter, 1000)

            const time = param.offsetTime + req.timeOnClip
            video.currentTime = param.loop ? time % video.duration : time
        })

        const rad = param.rotate * Math.PI / 180

        ctx.globalAlpha = _.clamp(param.opacity, 0, 100) / 100
        ctx.translate(param.x, param.y)
        ctx.translate(video.videoWidth / 2, video.videoHeight / 2)
        ctx.scale(param.scale / 100, param.scale / 100)
        ctx.rotate(rad)
        ctx.translate(-video.videoWidth / 2, -video.videoHeight / 2)

        ctx.drawImage(this._video, 0, 0)
    }
}
