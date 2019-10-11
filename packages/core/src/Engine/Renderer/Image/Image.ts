import _ from 'lodash'
import Type from '../../../PluginSupport/TypeDescriptor'
import { IRenderer } from '../RendererBase'

import { ParamType } from '../../ParamType'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'

interface ImageRendererParams {
  source: ParamType.Asset
  x: ParamType.Number
  y: ParamType.Number
  scale: ParamType.Float
  rotate: ParamType.Float
  opacity: ParamType.Float
}

export default class ImageLayer implements IRenderer<ImageRendererParams> {
  public static get rendererId(): string {
    return 'image'
  }

  public static provideAssetAssignMap() {
    return {
      jpeg: 'source',
      jpg: 'source',
      png: 'source',
      gif: 'source',
      svg: 'source',
    }
  }

  public static provideParameters() {
    return Type.asset('source', {
      label: 'Image',
      extensions: ['jpeg', 'jpg', 'png', 'gif', 'svg'],
    })
      .number('x', {
        label: 'Position X',
        animatable: true,
        defaultValue: 0,
      })
      .number('y', {
        label: 'Position Y',
        animatable: true,
        defaultValue: 0,
      })
      .float('scale', {
        label: 'Scale',
        animatable: true,
        defaultValue: 100,
      })
      .float('rotate', {
        label: 'Rotation',
        animatable: true,
        defaultValue: 0,
      })
      .float('opacity', {
        label: 'Opacity',
        animatable: true,
        defaultValue: 100,
      })
  }

  private image: HTMLImageElement | null = null

  public async beforeRender(context: ClipPreRenderContext<ImageRendererParams>) {
    const parameters = context.parameters

    if (!parameters.source) {
      this.image = null
      return
    }

    this.image = new Image()
    this.image.src = parameters.source.path

    await new Promise((resolve, reject) => {
      this.image!.addEventListener('load', () => resolve(), {
        once: true,
      } as any)
      this.image!.addEventListener(
        'error',
        () => reject(new Error(`ImageLayer: Image not found (URL: ${this.image!.src})`)),
        { once: true } as any,
      )
    })
  }

  public async render(context: ClipRenderContext<ImageRendererParams>) {
    if (!this.image) return

    const param = context.parameters
    const ctx = context.destCanvas.getContext('2d')!
    const img = this.image
    const rad = (param.rotate * Math.PI) / 180

    ctx.globalAlpha = _.clamp(param.opacity, 0, 100) / 100
    ctx.translate(param.x, param.y)
    ctx.translate(img.width / 2, img.height / 2)
    ctx.scale(param.scale / 100, param.scale / 100)
    ctx.rotate(rad)
    ctx.translate(-img.width / 2, -img.height / 2)

    ctx.drawImage(img, 0, 0)
  }
}
