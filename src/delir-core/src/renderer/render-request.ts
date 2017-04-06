// @flow
import Composition from '../project/composition'
import EntityResolver from './entity-resolver'

import * as _ from 'lodash'

export default class RenderRequest<T = any>
{
    static _permitKeys = [
        'time',
        'timeOnComposition',
        'timeOnClip',

        'frame',
        'frameOnComposition',
        'frameOnClip',

        'destCanvas',
        'width',
        'height',
        'framerate',
        'durationFrames',

        'destAudioBuffer',
        'audioContext',
        'samplingRate',
        'neededSamples',
        'audioChannels',
        'isBufferingFrame',

        // 'rootComposition', // not permitted
        'parentComposition',

        'compositionScope',
        'clipScope',

        'parameters',
    ]

    static _permitOnlyInitializeKey = [
        'rootComposition',
        'resolver',
    ]

    //
    // Current frame times
    //
    time: number
    timeOnComposition: number
    timeOnClip: number

    frame: number
    frameOnComposition: number
    frameOnClip: number

    //
    // Composition options
    //
    destCanvas: HTMLCanvasElement
    width: number
    height: number
    framerate: number
    durationFrames: number

    destAudioBuffer: Array<Float32Array>
    audioContext: AudioContext
    samplingRate: number
    neededSamples: number
    audioChannels: number
    isBufferingFrame: boolean

    //
    // Composition hierarchy
    //
    rootComposition: Composition
    parentComposition: Composition

    //
    // Variable store
    //
    compositionScope: Object
    clipScope: Object

    parameters: T

    //
    // Resolver
    //
    resolver: EntityResolver

    // alias
    get seconds(): number { return this.time }

    constructor(properties: Object = {})
    {
        const props = _.pick(
            properties,
            RenderRequest._permitKeys.concat(RenderRequest._permitOnlyInitializeKey)
        )

        Object.assign(this, props)
        Object.freeze(this)
    }

    /**
     * @deprecated
     */
    set(patch: Object): RenderRequest
    {
        const permitPatch = _.pick(patch, RenderRequest._permitKeys)
        return new RenderRequest(Object.assign({}, this, permitPatch))
    }

    clone(patch: Object): RenderRequest
    {
        const permitPatch = _.pick(patch, RenderRequest._permitKeys)
        return new RenderRequest(Object.assign({}, this, permitPatch))
    }
}
