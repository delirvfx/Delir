import * as _ from 'lodash'

import { Composition } from '../Entity'
import { ParameterValueTypes } from '../PluginSupport/type-descriptor'
import DependencyResolver from './DependencyResolver'

export default class PreRenderContext<T = {[propName: string]: ParameterValueTypes}>
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
    public parentComposition: Readonly<Composition> | null

    //
    // Variable store
    //
    // public compositionScope: {[prop: string]: any}
    // public clipScope: {[prop: string]: any}

    public parameters: T

    //
    // Resolver
    //
    public resolver: DependencyResolver

    constructor(properties: Partial<PreRenderContext<T>> = {})
    {
        const props = _.pick(properties, [
            ...PreRenderContext._permitKeys,
            ...PreRenderContext._permitOnlyInitializeKey
        ])

        Object.assign(this, props)
        Object.freeze(this)
    }

    public clone(patch: Partial<PreRenderContext<T>>): PreRenderContext<T>
    {
        const permitPatch = _.pick(patch, PreRenderContext._permitKeys)
        return new PreRenderContext<T>(Object.assign({}, this, permitPatch))
    }
}
