import Type from '../../../PluginSupport/TypeDescriptor'
import { ColorRGB } from '../../../Values'
import { ParamType } from '../../ParamType'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'
import { IRenderer } from '../RendererBase'

interface SolidRendererParam {
  color: ParamType.ColorRGB
  x: ParamType.Number
  y: ParamType.Number
  scale: ParamType.Float
}

export class SolidRenderer implements IRenderer<SolidRendererParam> {
  public static get rendererId(): string {
    return 'solid'
  }

  public static provideAssetAssignMap() {
    return {}
  }

  public static provideParameters() {
    return Type.colorRgb('color', { label: 'Color', animatable: true, defaultValue: () => new ColorRGB(0, 0, 0) })
      .number('x', { label: 'Position X', animatable: true, defaultValue: () => 0 })
      .number('y', { label: 'Position Y', animatable: true, defaultValue: () => 0 })
      .float('scale', { label: 'Scale', animatable: true, defaultValue: () => 100 })
  }

  public async beforeRender(context: ClipPreRenderContext<SolidRendererParam>) {}

  public async render(context: ClipRenderContext<SolidRendererParam>) {
    const ctx = context.destCanvas.getContext('2d')!
    const { color, x, y, scale } = context.parameters
    const normalScale = scale / 100
    const width = context.width * normalScale
    const height = context.height * normalScale

    ctx.fillStyle = color.toCSSColor()
    ctx.fillRect(x, y, width, height)
  }
}
