import * as _ from 'lodash'

import { Clip } from '../../Entity'
import { TypeDescriptor } from '../../PluginSupport/type-descriptor'
import { AssetPointer, Expression } from '../../Values'
import { RealParameterValues, RealParameterValueTypes } from '../Engine'
import { compileTypeScript } from '../ExpressionSupport/ExpressionCompiler'
import * as ExpressionContext from '../ExpressionSupport/ExpressionContext'
import ExpressionVM from '../ExpressionSupport/ExpressionVM'
import * as KeyframeHelper from '../KeyframeCalcurator'
import RenderContext from '../RenderContext'
import * as RendererFactory from '../Renderer'
import { IRenderer } from '../Renderer/RendererBase'
import EffectRenderTask from './EffectRenderTask'

export default class ClipRenderTask {
    public static build({clip, clipRendererCache, req}: {
        clip: Clip
        clipRendererCache: WeakMap<Clip, IRenderer<any>>
        req: RenderContext,
    }): ClipRenderTask {
        const rendererParams = RendererFactory.getInfo(clip.renderer).parameter
        const rendererAssetParamNames = rendererParams.properties.filter(prop => prop.type === 'ASSET').map(prop => prop.paramName)

        const rawRendererInitParam = KeyframeHelper.calcKeyframeValuesAt(0, clip.placedFrame, rendererParams, clip.keyframes)
        const rendererInitParam: RealParameterValues = { ...(rawRendererInitParam as any) }
        rendererAssetParamNames.forEach(propName => {
            // resolve asset
            rendererInitParam[propName] = rawRendererInitParam[propName]
                ? req.resolver.resolveAsset((rawRendererInitParam[propName] as AssetPointer).assetId)
                : null
        })

        let clipRenderer = clipRendererCache.get(clip)
        if (!clipRenderer) {
            clipRenderer = RendererFactory.create(clip.renderer)
            clipRendererCache.set(clip, clipRenderer)
        }

        const rawRendererKeyframeLUT = KeyframeHelper.calcKeyFrames(rendererParams, clip.keyframes, clip.placedFrame, 0, req.durationFrames)
        const rendererKeyframeLUT: { [paramName: string]: { [frame: number]: RealParameterValueTypes } } = { ...(rawRendererKeyframeLUT as any)　}
        rendererAssetParamNames.forEach(paramName => {
            // resolve asset
            rendererKeyframeLUT[paramName] = _.map(rawRendererKeyframeLUT[paramName], value => {
                return value ? req.resolver.resolveAsset((value as AssetPointer).assetId) : null
            })
        })

        const rendererExpressions = _(clip.expressions).mapValues((expr: Expression) => {
            const code = compileTypeScript(expr.code)
            return (exposes: ExpressionContext.ContextSource) => {
                return ExpressionVM.execute(code, ExpressionContext.buildContext(exposes), {filename: `${clip.id}.expression.ts`})
            }
        }).pickBy(value => value !== null).value()

        const task = new ClipRenderTask()
        task.clipRenderer = clipRenderer
        task.rendererParams = rendererParams
        task.rendererType = clip.renderer
        task.clipPlacedFrame = clip.placedFrame
        task.clipDurationFrames = clip.durationFrames
        task.keyframeLUT = rendererKeyframeLUT
        // FIXME: typing
        task.expressions = rendererExpressions as any
        task.initialKeyframeValues = rendererInitParam

        return task
    }

    public clipRenderer: IRenderer<any>
    public rendererParams: TypeDescriptor
    public rendererType: RendererFactory.AvailableRenderer
    public clipPlacedFrame: number
    public clipDurationFrames: number
    public keyframeLUT: { [paramName: string]: { [frame: number]: RealParameterValueTypes } }
    public expressions: { [paramName: string]: (context: ExpressionContext.ContextSource) => any }
    public effectRenderTask: EffectRenderTask[]
    private initialKeyframeValues: RealParameterValues

    public async initialize(req: RenderContext) {
        const preRenderReq = req.clone({parameters: this.initialKeyframeValues}).toPreRenderingRequest()
        await this.clipRenderer.beforeRender(preRenderReq)
    }
}
