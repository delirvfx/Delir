import _ from 'lodash'

import Type from '../../../PluginSupport/TypeDescriptor'
import { TypeDescriptor } from '../../../PluginSupport/TypeDescriptor'
import ColorRGBA from '../../../Values/ColorRGBA'
import { ParamType } from '../../ParamType'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'
import { IRenderer } from '../RendererBase'

interface TextRendererParam {
  text: ParamType.String
  family: ParamType.Enum
  weight: ParamType.Enum
  size: ParamType.Number
  lineHeight: ParamType.Number
  color: ParamType.ColorRGBA
  x: ParamType.Number
  y: ParamType.Number
  rotate: ParamType.Float
  opacity: ParamType.Float
}

export default class TextLayer implements IRenderer<TextRendererParam> {
  public static get rendererId(): string {
    return 'text'
  }

  // `getAvailableFontsSync` is very heavy, Cache returned result with _.once
  public static provideParameters = _.once(
    (): TypeDescriptor => {
      // Delay loading for testing
      let FontManager: any
      try {
        FontManager = require('font-manager')
      } catch (e) {
        FontManager = { getAvailableFontsSync: () => [] }
      }

      const fonts = FontManager.getAvailableFontsSync()
      const families: string[] = [
        'sans-serif',
        'serif',
        'cursive',
        'fantasy',
        'monospace',
        ...(_(fonts).map(desc => desc.family) as any)
          .uniq()
          .value()
          .sort((a: string, b: string) => (a < b ? -1 : 1)),
      ]

      return Type.string('text', {
        label: 'Text',
      })
        .enum('family', {
          label: 'Font family',
          selection: families,
        })
        .enum('weight', {
          label: 'weight',
          defaultValue: '400',
          selection: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
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
          defaultValue: new ColorRGBA(0, 0, 0, 1),
        })
        .number('x', {
          label: 'Position X',
          animatable: true,
        })
        .number('y', {
          label: 'Position Y',
          animatable: true,
        })
        .float('rotate', {
          label: 'Rotation',
          animatable: true,
        })
        .float('opacity', {
          label: 'Opacity',
          animatable: true,
          defaultValue: 100,
        })
    },
  )

  public static provideAssetAssignMap() {
    return {}
  }

  private bufferCanvas: HTMLCanvasElement

  public async beforeRender(context: ClipPreRenderContext<TextRendererParam>) {
    this.bufferCanvas = document.createElement('canvas')
  }

  public async render(context: ClipRenderContext<TextRendererParam>) {
    const param = context.parameters
    const ctx = context.destCanvas.getContext('2d')!
    const family = ['sans-serif', 'serif', 'cursive', 'fantasy', 'monospace'].includes(param.family)
      ? param.family
      : `"${param.family}"`
    const lineHeight = param.size * (param.lineHeight / 100)
    const rad = (param.rotate * Math.PI) / 180

    ctx.font = `${param.weight} ${param.size}px/${lineHeight} ${family}`

    const lines = param.text.split('\n')
    const height = lines.length * lineHeight
    const width = lines.reduce((mostLongWidth, line) => Math.max(mostLongWidth, ctx.measureText(line).width), 0)

    ctx.translate(param.x, param.y)
    ctx.translate(width / 2, height / 2)
    ctx.rotate(rad)
    ctx.translate(-width / 2, -height / 2)

    ctx.globalAlpha = _.clamp(param.opacity, 0, 100) / 100
    ctx.textBaseline = 'top'
    ctx.fillStyle = param.color.toString()

    let placePointY = 0

    for (const line of lines) {
      ctx.fillText(line, 0, placePointY)
      placePointY += lineHeight
    }
  }
}
