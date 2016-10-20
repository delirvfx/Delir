// @flow
import RenderRequest from './render-request'
import LayerInstanceContainer from './layer-instance-container'

import Canvas from '../abstraction/canvas'

export default class CompositionInstanceContainer
{
    _variableScope: Object = Object.create(null)
    _layers: Array<LayerInstanceContainer> = []

    async render(req: RenderRequest)
    {
        const _req: RenderRequest = req.set({
            compositionScope: this._variableScope,
        })

        const dests = await Promise.all(this._layers.map(async layer => {
            const destCanvas = new Canvas()
            destCanvas.width = _req.canvas.width
            destCanvas.height = _req.canvas.height

            const __req = _req.set({canvas: destCanvas})
            await layer.render(__req)
            return [layer, destCanvas]
        }))

        const renderOrderedDests = dests.slice().reverse()

        // composite
        // Top is over
        const context = _req.canvas.getContext('2d')
        renderOrderedDests.forEach(([layer, destCanvas]) => {
            context.drawImage(destCanvas, 0, 0)
        })
    }
}
