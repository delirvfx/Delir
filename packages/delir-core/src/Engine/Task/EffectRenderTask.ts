import * as _ from 'lodash'

import { Clip, Effect } from '../../Entity'
import { EffectPluginMissingException } from '../../exceptions'
import EffectPluginBase from '../../PluginSupport/PostEffectBase'
import { TypeDescriptor } from '../../PluginSupport/type-descriptor'
import { AssetPointer, Expression } from '../../Values'
import DependencyResolver from '../DependencyResolver'
import {  RealParameterValues, RealParameterValueTypes } from '../Engine'
import { compileTypeScript } from '../ExpressionSupport/ExpressionCompiler'
import * as ExpressionContext from '../ExpressionSupport/ExpressionContext'
import ExpressionVM from '../ExpressionSupport/ExpressionVM'
import * as KeyframeCalcurator from '../KeyframeCalcurator'
import RenderContext from '../RenderContext'

export default class EffectRenderTask {
    public static build({effect, clip, context, resolver, effectCache}: {
        effect: Effect,
        clip: Clip,
        effectCache: WeakMap<Effect, EffectPluginBase>,
        context: RenderContext,
        resolver: DependencyResolver,
    }): EffectRenderTask {
        const EffectPluginClass = resolver.resolveEffectPlugin(effect.processor)!

        if (EffectPluginClass == null) {
            throw new EffectPluginMissingException(`Missing effect plugin ${effect.processor}`, { effectId: effect.processor })
        }

        const effectParams = EffectPluginClass.provideParameters()
        const effectAssetParamNames = effectParams.properties.filter(prop => prop.type === 'ASSET').map(prop => prop.paramName)

        let effectRenderer = effectCache.get(effect)

        if (!effectRenderer) {
            effectRenderer = new EffectPluginClass()
            effectCache.set(effect, effectRenderer)
        }

        const rawInitialKeyframeValues = KeyframeCalcurator.calcKeyframeValuesAt(0, clip.placedFrame, effectParams, effect.keyframes)
        const initialKeyframeValues: RealParameterValues = { ...(rawInitialKeyframeValues as any) }
        effectAssetParamNames.forEach(propName => {
            // resolve asset
            initialKeyframeValues[propName] = rawInitialKeyframeValues[propName]
                ? resolver.resolveAsset((rawInitialKeyframeValues[propName] as AssetPointer).assetId)
                : null
        })

        const rawEffectKeyframeLUT = KeyframeCalcurator.calcKeyFrames(effectParams, effect.keyframes, clip.placedFrame, 0, context.durationFrames)
        const effectKeyframeLUT: { [paramName: string]: { [frame: number]: RealParameterValueTypes } } = {...(rawEffectKeyframeLUT as any)}
        effectAssetParamNames.forEach(propName => {
            // resolve asset
            effectKeyframeLUT[propName] = _.map(rawEffectKeyframeLUT[propName], value => {
                return value ? resolver.resolveAsset((value as AssetPointer).assetId) : null
            })
        })

        const effectExpressions = _(effect.expressions).mapValues((expr: Expression) => {
            const code = compileTypeScript(expr.code)
            return (exposes: ExpressionContext.ContextSource) => {
                return ExpressionVM.execute(code, ExpressionContext.buildContext(exposes), { filename: `${clip.id}.effect.expression.ts` })
            }
        }).pickBy(value => value !== null).value()

        const task = new EffectRenderTask()
        task.effectEntity = effect
        task.effectRenderer = effectRenderer
        task.effectorParams = effectParams
        task.keyframeLUT = effectKeyframeLUT
        task.initialKeyframeValues = initialKeyframeValues
        // TODO: Fix typing
        task.expressions = effectExpressions as any

        return task
    }

    public effectEntity: Effect
    public effectRenderer: EffectPluginBase
    public effectorParams: TypeDescriptor
    public keyframeLUT: { [paramName: string]: { [frame: number]: RealParameterValueTypes } }
    public expressions: { [paramName: string]: (exposes: ExpressionContext.ContextSource) => RealParameterValueTypes }
    private initialKeyframeValues: RealParameterValues

    public async initialize(context: RenderContext) {
        const preRenderReq = context.clone({parameters: this.initialKeyframeValues}).toPreRenderContext()
        await this.effectRenderer.initialize(preRenderReq)
    }
}
