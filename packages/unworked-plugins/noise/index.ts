import {
    EffectPluginBase,
    Exceptions,
    PluginPreRenderRequest,
    RenderRequest,
    Type,
    TypeDescriptor
} from '@ragg/delir-core'

import * as Tooloud from 'tooloud'

export default class NoiseEffectPlugin extends EffectPluginBase
{
    public static async pluginDidLoad()
    {
        // ✋( ͡° ͜ʖ ͡°) インターフェースに誓って
        if (typeof window === 'undefined') {
            throw new Exceptions.PluginLoadFailException('this plugin only running on Electron')
        }
    }

    public static provideParameters(): TypeDescriptor
    {
        return Type.none()
    }

    constructor()
    {
        super()
    }

    public async beforeRender(preRenderRequest: PluginPreRenderRequest) {}

    public async render(req: RenderRequest)
    {
        const canvas = req.destCanvas
        const ctx = req.destCanvas.getContext('2d')

        if (ctx == null) { return }

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const imageData: ImageData = ctx.getImageData(0, 0, req.destCanvas.width, req.destCanvas.height)
        const data: Uint8ClampedArray = imageData.data

        for (let x = 0; x < req.destCanvas.width; x++) {
          for (let y = 0; y < req.destCanvas.height; y++) {
            const head = (canvas.width * y * 4) + x
            const value = Tooloud.Worley.Euclidean(x, y, 0)
            data[head + 0] = (value[0] * 255) | 0
            data[head + 1] = (value[1] * 255) | 0
            data[head + 2] = (value[2] * 255) | 0
            data[head + 3] = 255
          }
        }

        ctx.putImageData(imageData, 0, 0)
    }
}
