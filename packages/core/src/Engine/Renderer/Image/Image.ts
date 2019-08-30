import _ from 'lodash'
import Type from '../../../PluginSupport/type-descriptor'
import { IRenderer } from '../RendererBase'

import { Asset } from '../../../Entity'
import { BBox2D } from '../../Inspector/BBox2D'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'

interface ImageRendererParams {
  source: Asset
  x: number
  y: number
  scale: number
  rotate: number
  opacity: number
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

  public async getBBox(context: ClipPreRenderContext<ImageRendererParams>): Promise<BBox2D> {
    if (!this.image) this.image = await this.loadImage(context.parameters.source.path)

    const img = this.image
    const { scale, x, y, rotate } = context.parameters

    return {
      visible: true,
      x,
      y,
      width: img.width * (scale / 100),
      height: img.height * (scale / 100),
      angleRad: (rotate * Math.PI) / 180,
    }
  }

  public async beforeRender(context: ClipPreRenderContext<ImageRendererParams>) {
    const parameters = context.parameters

    if (!parameters.source) {
      this.image = null
      return
    }

    this.image = await this.loadImage(parameters.source.path)
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

  private async loadImage(url: string): Promise<HTMLImageElement> {
    const image = new Image()
    image.src = url

    if (image.decode) {
      await image.decode()
      return image
    }

    await new Promise((resolve, reject) => {
      this.image!.addEventListener('load', () => resolve(), {
        once: true,
      } as any)

      this.image!.addEventListener(
        'error',
        () => reject(new Error(`ImageClip: failed to load image (URL: ${image.src})`)),
        { once: true } as any,
      )
    })

    return image
  }
}
