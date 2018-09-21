import {
    PostEffectBase,
    PreRenderContext,
    RenderContext,
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

    private canvas: HTMLCanvasElement
    private bufCtx: CanvasRenderingContext2D

    /**
     * Called when before rendering start.
     *
     * If you want initializing before rendering (likes load audio, image, etc...)
     * Do it in this method.
     */
    public async initialize(context: PreRenderContext)
    {
        const canvas = document.createElement('canvas')
        canvas.width = context.width
        canvas.height = context.height

        this.canvas = canvas
        this.bufCtx = canvas.getContext('2d')!
    }

    /**
     * Render frame into destination canvas.
     * @param context
     */
    public async render(context: RenderContext<Params>)
    {
        const param = context.parameters

        if (context.frameOnClip === 0) {
            this.bufCtx.drawImage(context.srcCanvas!, 0, 0)
        }

        const destCtx = context.destCanvas.getContext('2d')!
        destCtx.globalAlpha = clamp(param.opacity, 0, 100) / 100
        destCtx.clearRect(0, 0, context.width, context.height)
        destCtx.drawImage(this.canvas, 0, 0)
    }
}
