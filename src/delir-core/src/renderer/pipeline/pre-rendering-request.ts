import {ParameterValueTypes} from '../../plugin-support/type-descriptor'
import Composition from '../../project/composition'
import EntityResolver from './entity-resolver'

import * as _ from 'lodash'

export default class PreRenderingRequest<T = {[propName: string]: ParameterValueTypes}>
{
    private static _permitKeys = [
        'width',
        'height',
        'framerate',
        'durationFrames',

        'samplingRate',
        'audioChannels',

        'parentComposition',

        // 'compositionScope',
        // 'clipScope',

        'parameters',
    ]

    private static _permitOnlyInitializeKey = [
        'rootComposition',
        'resolver',
    ]

    //
    // Composition options
    //
    public width: number
    public height: number
    public framerate: number
    public durationFrames: number

    public samplingRate: number
    public audioBufferSize: number
    public audioChannels: number

    //
    // Composition hierarchy
    //
    public rootComposition: Readonly<Composition>
    public parentComposition: Readonly<Composition>|null

    //
    // Variable store
    //
    // public compositionScope: {[prop: string]: any}
    // public clipScope: {[prop: string]: any}

    public parameters: T

    //
    // Resolver
    //
    public resolver: EntityResolver

    constructor(properties: Optionalized<PreRenderingRequest<T>> = {})
    {
        const props = _.pick(
            properties,
            PreRenderingRequest._permitKeys.concat(PreRenderingRequest._permitOnlyInitializeKey)
        )

        Object.assign(this, props);
        Object.freeze(this);
    }

    public clone(patch: Optionalized<PreRenderingRequest<T>>): PreRenderingRequest<T>
    {
        const permitPatch = _.pick(patch, PreRenderingRequest._permitKeys)
        return new PreRenderingRequest<T>(Object.assign({}, this, permitPatch))
    }
}
