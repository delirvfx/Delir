// @flow
import type CustomLayerPluginBase from '../plugin/base/custom-layer-plugin-base'
import type Layer from '../project/layer'
import type Keyframe from '../project/keyframe'
import type PreRenderingRequest from './pre-rendering-request'
import type RenderRequest from './render-request'

import _ from 'lodash'
import KeyframeHelper from '../helper/keyframe-helper'
import {RenderingFailedException} from '../exceptions'
import PluginPreRenderingRequest from './plugin-pre-rendering-request'

export default class LayerInstanceContainer
{
    // _baseClass: Class<CustomLayerPluginBase>
    _layer: Layer
    _variableScope: Object = Object.create(null)

    _keyframes: Array<Keyframe>
    _timeOrderKeyframes: Array<Keyframe>
    _preCalcTable: {[propName: string]: KeyFrameSequence}

    _rendererInstance: Object

    // parameters : {[propertyId: string]: Object}

    get placedFrame(): number { return this._layer.placedFrame }
    get durationFrame(): number { return this._layer.durationFrame }

    constructor(layer : Layer)
    {
        this._layer = layer
        // this._baseClass = contain

        // this.parameters = Object.create(null)
        // this.parameters.transform = {
        //     dimention: ''
        // }
    }

    // getPresentParameters(): Object
    // {
    //     return {}
    // }

    async beforeRender(req: PreRenderingRequest)
    {
        // initialize renderer
        const Renderer = req.resolver.resolvePlugin(this._layer.renderer)
        if (Renderer == null) {
            throw new RenderingFailedException(`Failed to load Renderer plugin \`${this._layer.renderer}\``)
        }

        const options = this._layer.rendererOptions
        const paramTypes = Renderer.provideParameters()

        const params = {}
        paramTypes.properties.forEach(desc => params[desc.propName] = options[desc.propName] ? Object.assign({}, options[desc.propName]) : null)
        Object.freeze(params)

        const _req = PluginPreRenderingRequest.fromPreRenderingRequest(req).set({
            layerScope: this._variableScope,
            parameters: params,
        })

        this._rendererInstance = new Renderer
        try {
            await this._rendererInstance.beforeRender(_req)
        } catch (e) {
            throw new RenderingFailedException(`Failed to before rendering process for \`${Renderer.name}\` (${e.message})`, {before: e})
        }

        // Pre calculate keyframes
        const keyframes = Object.assign({}, this._layer.keyframes)
        _.each(paramTypes.properties, ({propName}) => keyframes[propName] = keyframes[propName] ? keyframes[propName] : [])
        this._preCalcTable = KeyframeHelper.calcKeyFrames(paramTypes, keyframes, 0, req.durationFrames)
    }

    async render(req: RenderRequest)
    {
        const closestComposition = req.parentComposition || req.rootComposition
        const placedTime = this._layer.placedFrame / closestComposition.framerate

        const keyframes = _.mapValues(this._preCalcTable, propTable => propTable[req.frame])

        const _req = req.set({
            timeOnLayer: req.timeOnComposition - placedTime,
            frameOnLayer: req.frameOnComposition - this._layer.placedFrame,
            layerScope: this._variableScope,
            parameters: Object.assign({}, this._layer.rendererOptions, keyframes)
        })

        // console.log(_req.frameOnComposition, _req.timeOnComposition);
        // console.log(this, this._rendererInstance);
        // console.time(`Render: ${this._layer.renderer}`)
        await this._rendererInstance.render(_req)
        // console.timeEnd(`Render: ${this._layer.renderer}`)
    }
}
