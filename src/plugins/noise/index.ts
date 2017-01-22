import {
    Type,
    TypeDescriptor,
    EffectPluginBase,
    PluginPreRenderRequest,
    RenderRequest,
    Exceptions
} from 'delir-core'

import * as Tooloud from 'tooloud'

console.log(Tooloud)

export default class NoiseEffectPlugin extends EffectPluginBase
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
        return Type.none()
    }

    constructor()
    {
        super()
    }

    async beforeRender(preRenderRequest: PluginPreRenderRequest)
    {
        const parameters = preRenderRequest.parameters as any
    }

    async render(req: RenderRequest)
    {
        const param = req.parameters as any
        const ctx = req.destCanvas.getContext('2d')

        if (ctx == null) { return }
        const data = ctx.getImageData(0, 0, req.destCanvas.width, req.destCanvas.height)

        for (let x = 0; x < req.destCanvas.width; x++) {
          for (let y = 0; y < req.destCanvas.height; y++) {
            const value = Tooloud.Worley.Euclidean(x, y, 0)
            data[x + 0] = value
            data[x + 1] = value
            data[x + 2] = value
            data[x + 3] = 255
          }
        }
    }
}
