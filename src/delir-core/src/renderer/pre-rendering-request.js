// @flow
import type CompositionInstanceContainer from './composition-instance-container'
import type EntityResolver from './entity-resolver'

import _ from 'lodash'

export default class PreRenderingRequest
{
    static _permitKeys = [
        'parentComposition',

        'compositionScope',
        'layerScope',

        'width',
        'height',
        'framerate',
        'durationFrames',

        'parameters',
    ]

    static _permitOnlyInitializeKey = [
        'rootComposition',
        'resolver',
    ]

    width: number
    height: number
    framerate: number
    durationFrames: number

    rootComposition: CompositionInstanceContainer
    parentComposition: CompositionInstanceContainer

    compositionScope: Object
    layerScope: Object

    parameters: Object

    resolver: EntityResolver

    constructor(properties: Object = {})
    {
        const props = _.pick(
            properties,
            PreRenderingRequest._permitKeys.concat(PreRenderingRequest._permitOnlyInitializeKey)
        )

        console.log(properties, props);

        Object.assign(this, props);
        Object.freeze(this);
    }

    set(patch: Object) : PreRenderingRequest
    {
        const permitPatch = _.pick(patch, PreRenderingRequest._permitKeys)
        return new PreRenderingRequest(Object.assign({}, this, permitPatch))
    }
}
