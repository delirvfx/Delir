// @flow
import type Point2D from '../struct/point-2d'
import Composition from '../project/composition'
import type EntityResolver from './entity-resolver'

import _ from 'lodash'

export default class RenderRequest
{
    static _permitKeys = [
        'time',
        'timeOnComposition',
        'timeOnLayer',

        'frame',
        'frameOnComposition',
        'frameOnLayer',

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

        // 'rootComposition', // not permitted
        'parentComposition',

        'compositionScope',
        'layerScope',

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
    timeOnLayer: number

    frame: number
    frameOnComposition: number
    frameOnLayer: number

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

    //
    // Composition hierarchy
    //
    rootComposition: Composition
    parentComposition: Composition

    //
    // Variable store
    //
    compositionScope: Object
    layerScope: Object

    parameters: Object

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

        Object.assign(this, props);
        Object.freeze(this);
    }

    set(patch: Object): RenderRequest
    {
        const permitPatch = _.pick(patch, RenderRequest._permitKeys)
        return new RenderRequest(Object.assign({}, this, permitPatch))
    }
}
