// @flow
import type CustomLayerPluginBase from '../plugin/base/custom-layer-plugin-base'
import type Layer from '../project/layer'
import type Keyframe from '../project/keyframe'
import type RenderRequest from './render-request'

import {RenderingFailedException} from '../exceptions'

export default class LayerInstanceContainer
{
    // _baseClass: Class<CustomLayerPluginBase>
    _layer: Layer
    _variableScope: Object = Object.create(null)

    _keyframes: Array<Keyframe>
    _timeOrderKeyframes: Array<Keyframe>

    _rendererInstance: Object

    // parameters : {[propertyId: string]: Object}

    get placedFrame(): number { return this._layer.placedFrame }

    constructor(layer : Layer)
    {
        this._layer = layer
        // this._baseClass = contain

        // this.parameters = Object.create(null)
        // this.parameters.transform = {
        //     dimention: ''
        // }
    }

    setParameter(patch: Object)
    {

    }

    // getPresentParameters(): Object
    // {
    //     return {}
    // }

    async beforeRender(preRenderReq: Object)
    {
        // initialize renderer
        const Renderer = preRenderReq.resolver.resolvePlugin(this._layer.renderer)

        if (Renderer == null) {
            throw new RenderingFailedException(`Failed to load Renderer plugin \`${this._layer.renderer}\``)
        }

        this._rendererInstance = new Renderer
        await this._rendererInstance.beforeRender(Object.assign({}, preRenderReq, {
            parameters: Object.assign({}, this._layer.rendererOptions)
        }))

        // Sort key frames
        this._keyframes = Array.from(this._layer.keyframes.values())
        this._timeOrderKeyframes = this._keyframes
            .sort((kfA, kfB) => kfA.frameOnLayer - kfB.frameOnLayer)
    }

    async render(req: RenderRequest)
    {
        const closestComposition = req.parentComposition || req.rootComposition
        const placedTime = this._layer.placedFrame / closestComposition.framerate

        const _req = req.set({
            timeOnLayer: req.timeOnComposition - placedTime,
            frameOnLayer: req.frameOnComposition - this._layer.placedFrame,
            layerScope: this._variableScope,
            parameters: Object.assign({}, this._layer.rendererOptions)
        })

        // console.log(_req.frameOnComposition, _req.timeOnComposition);
        // console.log(this, this._rendererInstance);
        await this._rendererInstance.render(_req)
    }
}
