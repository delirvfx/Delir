// @flow
import type Composition from '../project/composition'
import type EntityResolver from './entity-resolver'

import _ from 'lodash'

export default class PreRenderingRequest
{
    static _permitKeys = [
        // 'destCanvas',

        // 'rootComposition', // not permitted
        'parentComposition',

        'compositionScope',
        'layerScope',
    ]

    static _permitOnlyInitializeKey = [
        'rootComposition',
        'resolver',
    ]

    // destCanvas: HTMLCanvasElement

    rootComposition: Composition
    parentComposition: Composition

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

        Object.assign(this, props);
        Object.freeze(this);
    }

    set(patch: Object) : PreRenderingRequest
    {
        const permitPatch = _.pick(patch, PreRenderingRequest._permitKeys)
        return new PreRenderingRequest(Object.assign({}, this, permitPatch))
    }
}
