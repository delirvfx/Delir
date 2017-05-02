import {IRenderer} from './renderer-base'
import Type from '../../plugin-support/type-descriptor'
import {TypeDescriptor} from '../../plugin-support/type-descriptor'
import RenderingRequest from '../pipeline/render-request'

import ColorRGBA from '../../values/color-rgba'

import * as _ from 'lodash'
import * as FontManager from 'font-manager'

interface TextRendererParam {
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

export default class TextLayer implements IRenderer<TextRendererParam>
{
    public static get rendererId(): string { return 'text' }

    public static provideHandlableFileTypes()
    {
        return {}
    }

    // `getAvailableFontsSync` is very heavy, Cache returned result with _.once
    public static provideParameters = _.once((): TypeDescriptor =>
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
    })

    private _bufferCanvas: HTMLCanvasElement

    public async beforeRender(req: RenderingRequest<TextRendererParam>)
    {
        this._bufferCanvas = document.createElement('canvas')
    }

    public async render(req: RenderingRequest<TextRendererParam>)
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
}
