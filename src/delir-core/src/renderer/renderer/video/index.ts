import {
    Type,
    TypeDescriptor,
    LayerPluginBase,
    PluginPreRenderRequest,
    RenderRequest,
    Project,
    Exceptions
} from 'delir-core'

interface VideoLayerParam {
    source: Project.Asset
    loop: boolean
    offsetTime: number
    x: number
    y: number
    scale: number
    rotate: number
}

export default class VideoLayer extends LayerPluginBase
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

    video: HTMLVideoElement

    async beforeRender(preRenderRequest: PluginPreRenderRequest)
    {
        const parameters = preRenderRequest.parameters as any

        this.video = document.createElement('video')
        this.video.src = `file://${parameters.source.path}`
        this.video.loop = parameters.loop
        this.video.load()
        this.video.currentTime = -1

        await new Promise((resolve, reject) => {
            const onLoaded = () => {
                resolve()
                this.video.removeEventListener('error', onError, false)
            }

            const onError = () => {
                reject(new Error('video not found'))
                this.video.removeEventListener('loadeddata', onLoaded, false)
            }

            this.video.addEventListener('loadeddata', onLoaded, {once: true, capture: false} as any)
            this.video.addEventListener('error', onError, {once: true, capture: false}  as any)
        })
    }

    async render(req: RenderRequest<VideoLayerParam>)
    {
        const param = req.parameters
        const ctx = req.destCanvas.getContext('2d')!
        const video = this.video

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

        ctx.drawImage(this.video, 0, 0)
    }
}
