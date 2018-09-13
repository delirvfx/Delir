import {
    PostEffectBase,
    PreRenderRequest,
    RenderRequest,
    Type,
} from '@ragg/delir-core'

import * as clamp from 'lodash/clamp'

interface Params {
    opacity: number
}

export default class TheWorldPostEffect extends PostEffectBase {
    /**
     * Provide usable parameters
     */
    public static provideParameters() {
        return Type
            .float('opacity', {label: 'Opacity', defaultValue: 100, animatable: true})
    }

    private bufCtx: CanvasRenderingContext2D

    /**
     * Called when before rendering start.
     *
     * If you want initializing before rendering (likes load audio, image, etc...)
     * Do it in this method.
     */
    public async initialize(req: PreRenderRequest)
    {
        const canvas = document.createElement('canvas')
        canvas.width = req.width
        canvas.height = req.height

        this.bufCtx = canvas.getContext('2d')!
    }

    /**
     * Render frame into destination canvas.
     * @param req
     */
    public async render(req: RenderRequest<Params>)
    {
        const param = req.parameters
        const { canvas } = this.bufCtx

        if (req.frameOnClip === 0) {
            this.bufCtx.drawImage(req.srcCanvas!, 0, 0)
        }

        const destCtx = req.destCanvas.getContext('2d')!
        destCtx.globalAlpha = clamp(param.opacity, 0, 100) / 100
        destCtx.clearRect(0, 0, req.width, req.height)
        destCtx.drawImage(canvas, 0, 0)
    }
}
