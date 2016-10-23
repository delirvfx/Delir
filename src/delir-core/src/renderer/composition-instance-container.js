// @flow
import type Composition from '../project/composition'
import type RenderRequest from './render-request'
import type LayerInstanceContainer from './layer-instance-container'

import Canvas from '../abstraction/canvas'
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

    constructor(composition: Composition)
    {
        this._composition = composition
    }

    async beforeRender(preRenderReq: Object)
    {
        this._timelanes = await Promise.all(
            Array.from(this._composition.timelanes.values()).map(async timelane => {
                const laneWrap = new TimelaneInstanceContainer(timelane)
                laneWrap.beforeRender(preRenderReq)
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
            const destCanvas = new Canvas()
            destCanvas.width = _req.destCanvas.width
            destCanvas.height = _req.destCanvas.height
            const ctx = destCanvas.getContext('2d')
            ctx.clearRect(0, 0, destCanvas.width, destCanvas.height)

            const __req = _req.set({destCanvas: destCanvas})
            await layer.render(__req)
            return [layer, destCanvas]
        }))

        const renderOrderedDests = dests.slice().reverse()

        // composite
        // Top is over
        const context = _req.destCanvas.getContext('2d')
        if (context == null) return
        renderOrderedDests.forEach(([layer, destCanvas]) => {
            context.drawImage(destCanvas, 0, 0)
        })
    }
}
