import * as _ from 'lodash'
import * as KeyframeHelper from '../../../helper/keyframe-helper'
import { TypeDescriptor } from '../../../plugin-support/type-descriptor'
import { Clip } from '../../../project'
import { KeyframeValueTypes } from '../../../project/keyframe'
import { Expression } from '../../../values'
import * as RendererFactory from '../../renderer'
import { IRenderer } from '../../renderer/renderer-base'
import DependencyResolver from '../DependencyResolver'
import { compileTypeScript } from '../ExpressionCompiler'
import { Exposes } from '../ExpressionContext'
import * as ExpressionContext from '../ExpressionContext'
import ExpressionVM from '../ExpressionVM'
import RenderRequest from '../render-request'
import EffectRenderTask from './EffectRenderTask'

export default class ClipRenderTask {
    public static build({clip, effectRenderTask, clipRendererCache, req, resolver}: {
        clip: Clip
        clipRendererCache: WeakMap<Clip, IRenderer<any>>
        req: RenderRequest,
        resolver: DependencyResolver
    }): ClipRenderTask {
        const rendererParams = RendererFactory.getInfo(clip.renderer).parameter
        const rendererAssetParamNames = rendererParams.properties.filter(prop => prop.type === 'ASSET').map(prop => prop.propName)

        const rendererInitParam = KeyframeHelper.calcKeyframeValuesAt(0, clip.placedFrame, rendererParams, clip.keyframes)
        rendererAssetParamNames.forEach(propName => {
            rendererInitParam[propName] = rendererInitParam[propName]
                ? req.resolver.resolveAsset((rendererInitParam[propName] as AssetPointerScheme).assetId)
                : null
        })
        console.log(rendererInitParam)

        let clipRenderer = clipRendererCache.get(clip)
        if (!clipRenderer) {
            clipRenderer = RendererFactory.create(clip.renderer)
            clipRendererCache.set(clip, clipRenderer)
        }

        const rendererKeyframeLUT = KeyframeHelper.calcKeyFrames(rendererParams, clip.keyframes, clip.placedFrame, 0, req.durationFrames)
        rendererAssetParamNames.forEach(propName => {
            rendererKeyframeLUT[propName] = _.map(rendererKeyframeLUT[propName], value => {
                return value ? req.resolver.resolveAsset((value as AssetPointerScheme).assetId) : null
            })
        })

        const rendererExpressions = _(clip.expressions).mapValues((expr: Expression) => {
            const code = compileTypeScript(expr.code)
            return (exposes: ExpressionContext.Exposes) => {
                return ExpressionVM.execute(code, ExpressionContext.makeContext(exposes), {filename: `${clip.id}.expression.ts`})
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
        task.effectRenderTask = effectRenderTask

        return task
    }

    public clipRenderer: IRenderer<any>
    public rendererParams: TypeDescriptor
    public rendererType: RendererFactory.AvailableRenderer
    public clipPlacedFrame: number
    public clipDurationFrames: number
    public keyframeLUT: {[paramName: string]: KeyframeHelper.KeyframeParamValueSequence}
    public expressions: { [paramName: string]: (context: Exposes) => any }
    public effectRenderTask: EffectRenderTask[]
    private initialKeyframeValues: { [paramName: string]: KeyframeValueTypes }

    public async initialize(req: RenderRequest) {
        const preRenderReq = req.clone({parameters: this.initialKeyframeValues}).toPreRenderingRequest()
        await this.clipRenderer.beforeRender(preRenderReq)
    }
}
