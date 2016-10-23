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

        // 'rootComposition', // not permitted
        'parentComposition',

        'compositionScope',
        'layerScope',
    ]

    static _permitOnlyInitializeKey = [
        'rootComposition',
        'resolver',
    ]

    time : number
    timeOnComposition: number
    timeOnLayer: number

    frame : number
    frameOnComposition : number
    frameOnLayer: number

    destCanvas: HTMLCanvasElement

    rootComposition: Composition
    parentComposition: Composition

    compositionScope: Object
    layerScope: Object

    parameters: Object

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

    set(patch: Object) : RenderRequest
    {
        const permitPatch = _.pick(patch, RenderRequest._permitKeys)
        return new RenderRequest(Object.assign({}, this, permitPatch))
    }
}
