import _ from 'lodash'

import Type from '../../../PluginSupport/type-descriptor'
import { TypeDescriptor } from '../../../PluginSupport/type-descriptor'
import { BBox2D } from '../../Inspector/BBox2D'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'
import { IRenderer } from '../RendererBase'

interface Param {
  opacity: number
}

export default class AdjustmentRenderer implements IRenderer<Param> {
  public static get rendererId(): string {
    return 'adjustment'
  }

  public static provideAssetAssignMap() {
    return {}
  }

  public static provideParameters(): TypeDescriptor {
    return Type.number('opacity', {
      label: 'Opacity',
      defaultValue: 100,
      animatable: true,
    })
  }

  public async getBBox(context: ClipPreRenderContext<Param>): Promise<BBox2D> {
    return {
      visible: true,
      x: 0,
      y: 0,
      width: context.width,
      height: context.height,
      angleRad: 0,
    }
  }

  public async beforeRender(context: ClipPreRenderContext<Param>) {
    return
  }

  public async render(context: ClipRenderContext<Param>) {
    const ctx = context.destCanvas.getContext('2d')!
    ctx.drawImage(context.srcCanvas!, 0, 0)
  }
}
