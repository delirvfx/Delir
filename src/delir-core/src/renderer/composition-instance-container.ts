// @flow
import Composition from '../project/composition'
import PreRenderingRequest from './pre-rendering-request'
import RenderRequest from './render-request'
import TimelaneInstanceContainer from './timelane-instance-container'

export default class CompositionInstanceContainer
{
    _composition: Composition
    _variableScope: Object = Object.create(null)
    _timelanes: Array<TimelaneInstanceContainer> = []

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
            Array.from(this._composition.timelanes).map(async timelane => {
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

            parentComposition: req.rootComposition == this._composition ? null : this._composition,
            compositionScope: this._variableScope,
        })

        // Render timelanes
        const dests = await Promise.all<[TimelaneInstanceContainer, HTMLCanvasElement]>(this._timelanes.map(async timelane => {
            const destCanvas = document.createElement('canvas')
            destCanvas.width = _req.destCanvas.width
            destCanvas.height = _req.destCanvas.height

            const __req = _req.set({destCanvas: destCanvas})
            await timelane.render(__req)
            return [timelane, destCanvas]
        }))

        const renderOrderedDests = dests.slice().reverse()

        // composite
        // Top is over
        const context = req.destCanvas.getContext('2d')
        if (context == null) return

        if (req.rootComposition === this._composition) {
            context.fillStyle = this._composition.backgroundColor.toString()
            context.fillRect(0, 0, this._composition.width, this._composition.height)
        }

        renderOrderedDests.forEach(([clip, destCanvas]) => {
            context.drawImage(destCanvas, 0, 0)
        })
    }
}
