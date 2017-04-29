import {
    Type,
    TypeDescriptor,
    LayerPluginBase,
    PluginPreRenderRequest,
    RenderRequest,
    Exceptions,
    ColorRGBA
} from 'delir-core'

import * as _ from 'lodash'
import * as FontManager from 'font-manager'

interface TextLayerParam {
    text: string
    family: string
    weight: string
    size: number
    lineHeight: number
    color: ColorRGBA
    x: number
    y: number
    rotate: number
}

export default class TextLayer extends LayerPluginBase
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
        const fonts = FontManager.getAvailableFontsSync()
        const families: string[] = [
            'sans-serif',
            'serif',
            'cursive',
            'fantasy',
            'monospace',
            ...(_(fonts).map(desc => desc.family) as any).uniq().value().sort((a, b) => a < b ? -1 : 1)
        ]

        return Type
            .string('text', {
                label: 'Text',
            })
            .enum('family', {
                label: 'Font family',
                selection: families,
            })
            .enum('weight', {
                label: 'weight',
                defaultValue: "400",
                selection: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
            })
            .number('size', {
                label: 'Font size',
                defaultValue: 14,
            })
            .number('lineHeight', {
                label: 'Line height (%)',
                defaultValue: 100,
            })
            .colorRgba('color', {
                label: 'Color',
                defaultValue: new ColorRGBA(0, 0, 0, 1)
            })
            .number('x', {
                label: 'Position X',
                animatable: true,
            })
            .number('y', {
                label: 'Position Y',
                animatable: true,
            })
            .number('rotate', {
                label: 'Rotate',
                animatable: true,
            })
    }

    bufferCanvas: HTMLCanvasElement

    async beforeRender(preRenderRequest: PluginPreRenderRequest)
    {
        this.bufferCanvas = document.createElement('canvas')
    }

    async render(req: RenderRequest<TextLayerParam>)
    {
        const param = req.parameters
        const ctx = req.destCanvas.getContext('2d')!
        const family = ['sans-serif', 'serif', 'cursive', 'fantasy', 'monospace'].includes(param.family) ? param.family : `"${param.family}"`
        const lineHeight = param.lineHeight / 100

        const rad = param.rotate * Math.PI / 180

        ctx.translate(param.x, param.y)
        ctx.rotate(rad)

        ctx.textBaseline = 'top'
        ctx.fillStyle = param.color.toString()
        ctx.font = `${param.weight} ${param.size}px/${lineHeight} ${family}`

        let placePointY = 0
        const unit = param.size * lineHeight

        for (const line of param.text.split('\n')) {
            ctx.fillText(line, 0, placePointY)
            placePointY += unit
        }
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
