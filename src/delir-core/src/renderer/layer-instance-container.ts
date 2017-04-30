// @flow
import Layer from '../project/layer'
import PreRenderingRequest from './pre-rendering-request'
import RenderRequest from './render-request'
import ClipInstanceContainer from './clip-instance-container'

export default class LayerInstanceContainer
{
    private _layer: Layer
    private _clips: Array<ClipInstanceContainer> = []
    private _timeOrderClips: Array<ClipInstanceContainer> = []

    constructor(layer: Layer)
    {
        this._layer = layer
    }

    async beforeRender(preRenderReq: PreRenderingRequest)
    {
        this._clips = Array.from(this._layer.clips)
            .map(layer => new ClipInstanceContainer(layer))

        // sort layers
        this._timeOrderClips = this._clips.slice(0)
            .sort((layerA, layerB) => layerA.holdLayer.placedFrame - layerB.holdLayer.placedFrame)
        await Promise.all(this._clips.map(async layer => await layer.beforeRender(preRenderReq)))
    }

    async render(req: RenderRequest)
    {
        const targets = this._timeOrderClips.filter(layer => {
            return layer.placedFrame <= req.frameOnComposition
                && layer.placedFrame + layer.durationFrames >= req.frameOnComposition
        })

        await Promise.all(targets.map(async layer =>{
            await layer.render(req)
        }))
    }
}
