// @flow
import _ from 'lodash'

export default class RenderResponse
{
    static _permitKeys = [
        'destCanvas',
        // TODO: 'depthBufferCanvas',
        'destAudioBuffer',
    ]

    destCanvas: HTMLCanvasElement
    // TODO: depthBufferCanvas: HTMLCanvasElement
    destAudioBuffer: Array<Float32Array>

    constructor(properties: Object)
    {
        const props = _.pick(properties, RenderResponse._permitKeys)
        Object.assign(this, props)
        Object.freeze(this)
    }

    clone(patch: Object): RenderResponse
    {
        return new RenderResponse(Object.assign({}, this, patch))
    }
}
