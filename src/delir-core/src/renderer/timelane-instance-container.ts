// @flow
import type Timelane from '../project/timelane'
import type Layer from '../project/layer'
import type PreRenderingRequest from './pre-rendering-request'
import type RenderRequest from './render-request'
import LayerInstanceContainer from './layer-instance-container'

export default class TimelaneInstanceContainer
{
    _timelane: Timelane
    _layers: Array<LayerInstanceContainer> = []
    _timeOrderLayers: Array<LayerInstanceContainer> = []

    constructor(timelane: Timelane)
    {
        this._timelane = timelane
    }

    async beforeRender(preRenderReq: PreRenderingRequest)
    {
        this._layers = Array.from(this._timelane.layers.values())
            .map(layer => new LayerInstanceContainer(layer))

        // sort layers
        this._timeOrderLayers = this._layers.slice(0)
            .sort((layerA, layerB) => layerA._layer.placedFrame - layerB._layer.placedFrame)
        await Promise.all(this._layers.map(async layer => await layer.beforeRender(preRenderReq)))
    }

    async render(req: RenderRequest)
    {
        const targets = this._timeOrderLayers.filter(layer => {
            return layer.placedFrame <= req.frameOnComposition
                && layer.placedFrame + layer.durationFrames >= req.frameOnComposition
        })

        await Promise.all(targets.map(async layer =>{
            await layer.render(req)
        }))
    }
}
