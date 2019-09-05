import Type from '../../../PluginSupport/TypeDescriptor'
import { ColorRGB, ColorRGBA } from '../../../Values'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'
import { ShapeProxy } from '../../RuntimeValue/ShapeProxy'
import { IRenderer } from '../RendererBase'

interface Params {
  shape: ShapeProxy
  x: number
  y: number
  fill: ColorRGBA
  stroke: ColorRGBA
  strokeWidth: number
  scale: number
  rotate: number
  opacity: number
}

export class ShapeRenderer implements IRenderer<Params> {
  public static get rendererId(): string {
    return 'shape'
  }

  public static provideAssetAssignMap() {
    return {}
  }

  public static provideParameters() {
    return Type.shape('shape', {
      label: 'Shape',
      defaultValue: '',
    })
      .colorRgba('fill', {
        label: 'Fill color',
        animatable: true,
        defaultValue: new ColorRGBA(203, 126, 255, 255),
      })
      .colorRgba('stroke', {
        label: 'Stroke color',
        animatable: true,
        defaultValue: new ColorRGBA(0, 0, 0, 0),
      })
      .float('strokeWidth', {
        label: 'Stroke width',
        animatable: true,
        defaultValue: 0,
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

  private svgRoot: SVGSVGElement
  private pathEl: SVGPathElement

  public async beforeRender(context: ClipPreRenderContext<Params>) {
    this.svgRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.svgRoot.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    this.svgRoot.setAttribute('viewBox', `0 0 ${context.width} ${context.height}`)
    this.svgRoot.setAttribute('width', `${context.width}`)
    this.svgRoot.setAttribute('height', `${context.height}`)

    this.pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    this.svgRoot.appendChild(this.pathEl)
  }

  public async render(context: ClipRenderContext<Params>) {
    const { shape, ...params } = context.parameters
    this.pathEl.setAttribute('d', shape.toString())
    this.pathEl.style.fill = params.fill.toCSSColor()

    const blob = new Blob([`<?xml version="1.0"?>${this.svgRoot.outerHTML}`], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.src = url
    await img.decode()
    context.destCanvas.getContext('2d')!.drawImage(img, 0, 0)

    URL.revokeObjectURL(url)
  }
}
