// @flow
import Timelane from '../project/timelane'
import PreRenderingRequest from './pre-rendering-request'
import RenderRequest from './render-request'
import ClipInstanceContainer from './clip-instance-container'

export default class TimelaneInstanceContainer
{
    private _timelane: Timelane
    private _layers: Array<ClipInstanceContainer> = []
    private _timeOrderLayers: Array<ClipInstanceContainer> = []

    constructor(timelane: Timelane)
    {
        this._timelane = timelane
    }

    async beforeRender(preRenderReq: PreRenderingRequest)
    {
        this._layers = Array.from(this._timelane.layers.values())
            .map(layer => new ClipInstanceContainer(layer))

        // sort layers
        this._timeOrderLayers = this._layers.slice(0)
            .sort((layerA, layerB) => layerA.holdLayer.placedFrame - layerB.holdLayer.placedFrame)
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
