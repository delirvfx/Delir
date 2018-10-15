import * as _ from 'lodash'

import { Clip, Effect } from '../../Entity'
import { EffectPluginMissingException } from '../../Exceptions'
import EffectPluginBase from '../../PluginSupport/PostEffectBase'
import { TypeDescriptor } from '../../PluginSupport/type-descriptor'
import DependencyResolver from '../DependencyResolver'
import * as ExpressionContext from '../ExpressionSupport/ExpressionContext'
import { ReferenceableEffectsParams } from '../ExpressionSupport/ExpressionContext'
import { RealParameterValueTypes } from '../ParametersTable'
import { ParametersTable } from '../ParametersTable'
import { RenderContextBase } from '../RenderContext/RenderContextBase'

export default class EffectRenderTask {
    public static build({effect, clip, context, resolver, effectCache}: {
        effect: Effect,
        clip: Clip,
        effectCache: WeakMap<Effect, EffectPluginBase>,
        context: RenderContextBase,
        resolver: DependencyResolver,
    }): EffectRenderTask {
        const EffectPluginClass = resolver.resolveEffectPlugin(effect.processor)!

        if (EffectPluginClass == null) {
            throw new EffectPluginMissingException(`Missing effect plugin ${effect.processor}`, { effectId: effect.processor })
        }

        const effectParams = EffectPluginClass.provideParameters()
        const keyframeTable = ParametersTable.build(context, clip, effect.keyframes, effect.expressions, effectParams)
        let effectRenderer = effectCache.get(effect)

        if (!effectRenderer) {
            effectRenderer = new EffectPluginClass()
            effectCache.set(effect, effectRenderer)
        }

        const task = new EffectRenderTask()
        task.effectEntity = effect
        task.effectRenderer = effectRenderer
        task.paramTypes = effectParams
        task.keyframeTable =  keyframeTable

        return task
    }

    public effectEntity: Effect
    public effectRenderer: EffectPluginBase
    public paramTypes: TypeDescriptor
    public expressions: { [paramName: string]: (exposes: ExpressionContext.ContextSource) => RealParameterValueTypes }
    public keyframeTable: ParametersTable

    public async initialize(context: RenderContextBase, referenceableEffectParams: ReferenceableEffectsParams) {
        const preRenderReq = context.toEffectPreRenderContext({
            parameters: this.keyframeTable.initialParams,
            clipEffectParams: referenceableEffectParams,
        })

        await this.effectRenderer.initialize(preRenderReq)
    }
}
