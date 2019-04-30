import { Clip, Effect } from '../../Entity'
import EffectPluginBase from '../../PluginSupport/PostEffectBase'
import { TypeDescriptor } from '../../PluginSupport/type-descriptor'
import DependencyResolver from '../DependencyResolver'
import * as ExpressionContext from '../ExpressionSupport/ExpressionContext'
import { ReferenceableEffectsParams } from '../ExpressionSupport/ExpressionContext'
import { RealParameterValueTypes } from '../ParametersTable'
import { ParametersTable } from '../ParametersTable'
import { RenderContextBase } from '../RenderContext/RenderContextBase'
export default class EffectRenderTask {
    public static build({
        effect,
        clip,
        context,
        resolver,
        effectCache,
    }: {
        effect: Effect
        clip: Clip
        effectCache: WeakMap<Effect, EffectPluginBase>
        context: RenderContextBase
        resolver: DependencyResolver
    }): EffectRenderTask
    public effectEntity: Effect
    public effectRenderer: EffectPluginBase
    public paramTypes: TypeDescriptor
    public expressions: {
        [paramName: string]: (exposes: ExpressionContext.ContextSource) => RealParameterValueTypes
    }
    public keyframeTable: ParametersTable
    public initialize(context: RenderContextBase, referenceableEffectParams: ReferenceableEffectsParams): Promise<void>
}
