import { TypeDescriptor } from '../../PluginSupport/type-descriptor'
import { BBox } from '../Inspector/BBox'
import { ClipPreRenderContext } from '../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../RenderContext/ClipRenderContext'

export interface IRendererStatic {
  rendererId: string

  new (): IRenderer<any>
  provideAssetAssignMap(): { [extName: string]: string }
  provideParameters(): TypeDescriptor
}

export interface IRenderer<T> {
  getBBox(request: ClipPreRenderContext<T>): Promise<BBox>
  beforeRender(request: ClipPreRenderContext<T>): Promise<void>
  render(request: ClipRenderContext<T>): Promise<void>
}
