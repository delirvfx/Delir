// @flow
import type CompositionInstanceContainer from './composition-instance-container'
import type PreRenderingRequest from './pre-rendering-request'
import type EntityResolver from './entity-resolver'

import _ from 'lodash'

export default class PluginPreRenderingRequest
{
    static _permitKeys = [
        'width',
        'height',
        'framerate',

        'compositionScope',
        'layerScope',

        'parameters',
    ]

    static _permitOnlyInitializeKey = [
        'rootComposition',
        'resolver',
    ]

    static fromPreRenderingRequest(preRenderingRequest: PreRenderingRequest)
    {
        return new PluginPreRenderingRequest(preRenderingRequest)
    }

    width: number
    height: number
    framerate: number

    compositionScope: Object
    layerScope: Object

    parameters: Object

    resolver: EntityResolver

    constructor(properties: Object = {})
    {
        const props = _.pick(
            properties,
            PluginPreRenderingRequest._permitKeys.concat(PluginPreRenderingRequest._permitOnlyInitializeKey)
        )

        Object.assign(this, props);
        Object.freeze(this);
    }

    set(patch: Object) : PluginPreRenderingRequest
    {
        const permitPatch = _.pick(patch, PluginPreRenderingRequest._permitKeys)
        return new PluginPreRenderingRequest(Object.assign({}, this, permitPatch))
    }
}
