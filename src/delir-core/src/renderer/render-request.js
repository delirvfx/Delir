// @flow
import type Point2D from '../struct/point-2d'

export default class RenderRequest
{
    time : ?number = null
    timeOnComposition: ?number = null
    frame : ?number = null
    frameOnComposition: ?number = null

    canvas: HTMLCanvasElement = null
    // canvasContext: ?CanvasRenderingContext2D = null

    compositionScope: ?Object = null
    layerScope: ?Object = null

    constructor(properties: Object = {})
    {
        Object.seal(this);
        Object.assign(this, properties);
        Object.freeze(this);
    }

    set(patch: Object) : RenderRequest
    {
        return new RenderRequest(Object.assign({}, this, patch))
    }
}
