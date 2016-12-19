import CompositionInstanceContainer from './composition-instance-container'
import EntityResolver from './entity-resolver'

import * as _ from 'lodash'

export default class PreRenderingRequest
{
    static _permitKeys = [
        'width',
        'height',
        'framerate',
        'durationFrames',

        'samplingRate',
        'audioChannels',

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
    // Composition options
    //
    width: number
    height: number
    framerate: number
    durationFrames: number

    audioContext: AudioContext
    samplingRate: number
    audioBufferSize: number
    audioChannels: number

    //
    // Composition hierarchy
    //
    rootComposition: CompositionInstanceContainer
    parentComposition: CompositionInstanceContainer

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

    constructor(properties: Object = {})
    {
        const props = _.pick(
            properties,
            PreRenderingRequest._permitKeys.concat(PreRenderingRequest._permitOnlyInitializeKey)
        )

        Object.assign(this, props);
        Object.freeze(this);
    }

    set(patch: Object) : PreRenderingRequest
    {
        const permitPatch = _.pick(patch, PreRenderingRequest._permitKeys)
        return new PreRenderingRequest(Object.assign({}, this, permitPatch))
    }
}
