import { RealParameterValues } from '../ParametersTable'
import { IRenderContextBase } from './IRenderContextBase'

export interface ClipPreRenderContext<T extends {[paramName: string]: any}> extends IRenderContextBase, ClipPreRenderContextAttributes<T> {}

export interface ClipPreRenderContextAttributes<T extends RealParameterValues> {
    parameters: T
}
