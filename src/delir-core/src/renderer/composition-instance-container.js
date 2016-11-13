// @flow
import type Composition from '../project/composition'
import type PreRenderingRequest from './pre-rendering-request'
import type RenderRequest from './render-request'
import type LayerInstanceContainer from './layer-instance-container'

import TimelaneInstanceContainer from './timelane-instance-container'

export default class CompositionInstanceContainer
{
    _composition: Composition
    _variableScope: Object = Object.create(null)
    _timelanes: Array<TimelaneInstanceContainer> = []
    // _layers: Array<LayerInstanceContainer> = []

    get framerate(): number { return this._composition.framerate }
    get width(): number { return this._composition.width }
    get height(): number { return this._composition.height }
    get durationFrames(): number { return this._composition.durationFrames }
    get samplingRate(): number { return this._composition.samplingRate }
    get audioChannels(): number { return this._composition.audioChannels }

    constructor(composition: Composition)
    {
        this._composition = composition
    }

    async beforeRender(req: PreRenderingRequest)
    {
        this._timelanes = await Promise.all(
            Array.from(this._composition.timelanes.values()).map(async timelane => {
                const laneWrap = new TimelaneInstanceContainer(timelane)
                await laneWrap.beforeRender(req.set({
                    parentComposition: req.rootComposition == this ? null : this,
                    compositionScope: this._variableScope,
                }))
                return laneWrap
            })
        )
    }

    async render(req: RenderRequest)
    {
        const _req: RenderRequest = req.set({
            timeOnComposition: req.time,
            frameOnComposition: req.frame,

            parentComposition: req.rootComposition == this ? null : this,
            compositionScope: this._variableScope,
        })

        // Render timelanes
        const dests = await Promise.all(this._timelanes.map(async layer => {
            const destCanvas = document.createElement('canvas')
            destCanvas.width = _req.destCanvas.width
            destCanvas.height = _req.destCanvas.height

            const __req = _req.set({destCanvas: destCanvas})
            await layer.render(__req)
            return [layer, destCanvas]
        }))

        const renderOrderedDests = dests.slice().reverse()

        // composite
        // Top is over
        const context = req.destCanvas.getContext('2d')
        if (context == null) return
        renderOrderedDests.forEach(([layer, destCanvas]) => {
            context.drawImage(destCanvas, 0, 0)
        })
    }
}
