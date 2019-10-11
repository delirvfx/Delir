import { TypeDescriptor } from '../../PluginSupport/type-descriptor'
import { BBox2D } from '../Inspector/BBox2D'
import { ClipPreRenderContext } from '../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../RenderContext/ClipRenderContext'

export interface IRendererStatic {
  rendererId: string

  new (): IRenderer<any>
  provideAssetAssignMap(): { [extName: string]: string }
  provideParameters(): TypeDescriptor
}

export interface IRenderer<T> {
  getBBox(request: ClipPreRenderContext<T>): Promise<BBox2D>
  beforeRender(request: ClipPreRenderContext<T>): Promise<void>
  render(request: ClipRenderContext<T>): Promise<void>
}
