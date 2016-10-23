// @flow
import type Timelane from '../project/timelane'
import type Layer from '../project/layer'
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

    async beforeRender(preRenderReq: Object)
    {
        this._layers = Array.from(this._timelane.layers.values())
            .map(layer => new LayerInstanceContainer(layer))

        // sort layers
        this._timeOrderLayers = this._layers
            .sort((layerA, layerB) => layerA._layer.placedFrame - layerB._layer.placedFrame)

        await Promise.all(this._layers.map(layer => layer.beforeRender(preRenderReq)))
    }

    async render(req: RenderRequest)
    {
        // const targets = this._timeOrderLayers.filter(layer => layer.placedFrame >= req.frameOnComposition)
        const targets = this._timeOrderLayers

        // console.log(targets)
        await Promise.all(targets.map(async layer =>{
            await layer.render(req)
        }))
    }
}
