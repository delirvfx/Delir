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

    _rendererClass: Class<CustomLayerPluginBase>
    _rendererInstance: Object

    get placedFrame(): number { return this._layer.placedFrame }
    get durationFrames(): number { return this._layer.durationFrames }

    constructor(layer : Layer)
    {
        this._layer = layer
    }

    // getPresentParameters(): Object
    // {
    //     return {}
    // }

    async beforeRender(req: PreRenderingRequest)
    {
        // Resolve renderers
        if (! this._rendererInstance) {
            const Renderer = req.resolver.resolvePlugin(this._layer.renderer)

            if (Renderer == null) {
                throw new RenderingFailedException(`Failed to load Renderer plugin \`${this._layer.renderer}\``)
            }

            this._rendererClass = Renderer
            this._rendererInstance = new Renderer
        }

        // Build renderer initialization requests
        const receiveOptions = this._layer.rendererOptions
        const paramTypes = this._rendererClass.provideParameters()

        const params = {}
        paramTypes.properties.forEach(desc => {
            if (receiveOptions[desc.propName]) {
                if (desc.type === 'ASSET') {
                    params[desc.propName] = receiveOptions[desc.propName].toJSON()
                } else {
                    params[desc.propName] = Object.assign({}, receiveOptions[desc.propName])
                }
            } else {
                params[desc.propName] = null
            }
        })

        Object.freeze(params)

        console.log(params, receiveOptions['source']);
        const preRenderReq = PluginPreRenderingRequest.fromPreRenderingRequest(req).set({
            layerScope: this._variableScope,
            parameters: params,
        })
        console.log('before render0', this._rendererClass, this._rendererInstance, this._rendererInstance.beforeRender);

        // initialize
        try {
            console.log('before render');
            await this._rendererInstance.beforeRender(preRenderReq)
        } catch (e) {
            console.error(e);
            throw new RenderingFailedException(`Failed to before rendering process for \`${this._rendererClass.name}\` (${e.message})`, {before: e})
        }

        // Pre calculate keyframe interpolation
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

        await this._rendererInstance.render(_req)
    }
}
