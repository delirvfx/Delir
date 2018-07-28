// @flow
import * as _ from 'lodash'

export default class RenderResponse
{
    public static _permitKeys = [
        'destCanvas',
        // TODO: 'depthBufferCanvas',
        'destAudioBuffer',
    ]

    public destCanvas: HTMLCanvasElement
    // TODO: depthBufferCanvas: HTMLCanvasElement
    public destAudioBuffer: Array<Float32Array>

    constructor(properties: Object)
    {
        const props = _.pick(properties, RenderResponse._permitKeys)
        Object.assign(this, props)
        Object.freeze(this)
    }

    public clone(patch: Object): RenderResponse
    {
        return new RenderResponse(Object.assign({}, this, patch))
    }
}
