import {TypeDescriptor} from '../../plugin-support/type-descriptor'
import PreRenderingRequest from '../pipeline/pre-rendering-request'
import RenderingRequest from '../pipeline/render-request'
import {ClipBound} from '../pipeline/ExpressionContext'

export interface IRendererStatic {
    rendererId: string
    provideAssetAssignMap(): {[extName: string]: string}
    provideParameters(): TypeDescriptor

    new(): IRenderer<any>
}

export interface IRenderer<T> {
    beforeRender(request: PreRenderingRequest<T>): Promise<void>
    calculateBound(beforeExpressionParams: T): ClipBound
    render(request: RenderingRequest<T>): Promise<void>
}
