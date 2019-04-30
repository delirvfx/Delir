import { Clip } from '../../Entity'
import { RealParameterValues } from '../ParametersTable'
import { IRenderContextBase } from './IRenderContextBase'
export interface ClipPreRenderContext<
    T extends {
        [paramName: string]: any
    }
> extends IRenderContextBase, ClipPreRenderContextAttributes<T> {}
export interface ClipPreRenderContextAttributes<T extends RealParameterValues> {
    clip: Clip
    parameters: T
}
