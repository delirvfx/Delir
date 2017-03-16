// @flow
import LayerPluginBase from '../plugin/layer-plugin-base'
import EffectPluginBase from '../plugin/effect-plugin-base'

import Clip from '../project/clip'
import Keyframe from '../project/keyframe'
import PreRenderingRequest from './pre-rendering-request'
import RenderRequest from './render-request'

import * as _ from 'lodash'
import * as KeyframeHelper from '../helper/keyframe-helper'
import {KeyFrameSequence} from '../helper/keyframe-helper'
import {RenderingFailedException} from '../exceptions'
import PluginPreRenderingRequest from './plugin-pre-rendering-request'

export default class ClipInstanceContainer
{
    // _baseClass: Class<ClipPluginBase>
    private clip: Clip
    private _variableScope: Object = Object.create(null)

    // private _keyframes: Array<Keyframe>
    // private _timeOrderKeyframes: Array<Keyframe>
    private _preCalcTable: {[propName: string]: KeyFrameSequence}

    private _rendererClass: typeof LayerPluginBase
    private _rendererInstance: LayerPluginBase

    private effectInstances: Array<EffectPluginBase>

    get holdClip(): Clip { return this.clip }
    get placedFrame(): number { return this.clip.placedFrame }
    get durationFrames(): number { return this.clip.durationFrames }

    constructor(clip : Clip)
    {
        this.clip = clip
    }

    // getPresentParameters(): Object
    // {
    //     return {}
    // }

    async beforeRender(req: PreRenderingRequest)
    {
        // Resolve renderers
        if (! this._rendererInstance) {
            const Renderer: typeof LayerPluginBase = req.resolver.resolvePlugin(this.clip.renderer)

            if (Renderer == null) {
                throw new RenderingFailedException(`Failed to load Renderer plugin \`${this.clip.renderer}\``)
            }

            this._rendererClass = Renderer
            this._rendererInstance = new Renderer
        }

        // Resolve effects
        if (! this.effectInstances) {
            this.effectInstances = []

            for (const effect of this.clip.effects) {
                const Effector = req.resolver.resolvePlugin(effect.processor)

                if (Effector == null || ! (Effector.prototype instanceof EffectPluginBase)) {
                    throw new RenderingFailedException(`Failed to resolve Effect plugin \`${effect.processor}\``)
                }

                this.effectInstances.push(new Effector as EffectPluginBase)
            }
        }

        // Build renderer initialization requests
        // const receiveOptions: {[propName: string]: any} = this.clip.rendererOptions
        const paramTypes = this._rendererClass.provideParameters()
        // const params =

        const params: {[propName: string]: any} = {}
        paramTypes.properties.forEach(desc => {
            params[desc.propName] = KeyframeHelper.calcKeyframeValueAt(0, desc, this.clip.keyframes[desc.propName] || [])
        })

        const preRenderReq = PluginPreRenderingRequest.fromPreRenderingRequest(req).set({
            clipScope: this._variableScope,
            parameters: Object.freeze(params),
        })

        // initialize
        try {
            await this._rendererInstance.beforeRender(preRenderReq)
        } catch (e) {
            throw new RenderingFailedException(`Failed to before rendering process for \`${this._rendererClass.name}\` (${e.message})`, {before: e})
        }

        let effect

        try {
            for (const effector of this.effectInstances) {
                effect = effector.constructor.name
                await effector.beforeRender(preRenderReq)
            }
        } catch (e) {
            throw new RenderingFailedException(`Failed to before renderering process for \`${effect}\``)
        }

        // Pre calculate keyframe interpolation
        const keyframes: {[propName: string]: Keyframe[]} = Object.assign({}, this.clip.keyframes)
        _.each(paramTypes.properties, ({propName}) => keyframes[propName] = keyframes[propName] ? Array.from(keyframes[propName]) : [])
        this._preCalcTable = KeyframeHelper.calcKeyFrames(paramTypes, keyframes, 0, req.durationFrames)
    }

    async render(req: RenderRequest)
    {
        const closestComposition = req.parentComposition || req.rootComposition
        const placedTime = this.clip.placedFrame / closestComposition.framerate

        const paramTypes = this._rendererClass.provideParameters()
        const keyframes: {[propName: string]: ParameterValueTypes} = {}

        paramTypes.properties.forEach(desc => {
            keyframes[desc.propName] = desc.animatable
                ? this._preCalcTable[desc.propName][req.frame]
                : this._preCalcTable[desc.propName][0]
        })

        const _req = req.set({
            timeOnClip: req.timeOnComposition - placedTime,
            frameOnClip: req.frameOnComposition - this.clip.placedFrame,
            clipScope: this._variableScope,
            parameters: keyframes,
        })

        await this._rendererInstance.render(_req)

        // Apply effects
        for (const effect of this.effectInstances) {
            await effect.render(_req)
        }
    }
}
