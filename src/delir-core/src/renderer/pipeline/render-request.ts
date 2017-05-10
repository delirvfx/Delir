import {ParameterValueTypes} from '../../plugin-support/type-descriptor'
import Composition from '../../project/composition'
import EntityResolver from './entity-resolver'
import PreRenderingRequest from './pre-rendering-request'

import * as _ from 'lodash'

export default class RenderRequest<T = {[propName: string]: ParameterValueTypes}>
{
    private static _permitKeys = [
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

        // 'compositionScope',
        // 'clipScope',

        'parameters',
    ]

    private static _permitOnlyInitializeKey = [
        'rootComposition',
        'resolver',
    ]

    //
    // Current frame times
    //
    public time: number
    public timeOnComposition: number
    public timeOnClip: number

    public frame: number
    public frameOnComposition: number
    public frameOnClip: number

    //
    // Composition options
    //
    public destCanvas: HTMLCanvasElement
    public width: number
    public height: number
    public framerate: number
    public durationFrames: number

    public destAudioBuffer: Float32Array[]
    public audioContext: AudioContext|OfflineAudioContext
    public samplingRate: number
    public neededSamples: number
    public audioChannels: number
    public isBufferingFrame: boolean

    //
    // Composition hierarchy
    //
    public rootComposition: Readonly<Composition>
    public parentComposition: Readonly<Composition>

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

    // alias
    public get seconds(): number { return this.time }

    constructor(properties: Optionalized<RenderRequest<T>> = {})
    {
        const props = _.pick(
            properties,
            RenderRequest._permitKeys.concat(RenderRequest._permitOnlyInitializeKey)
        )

        Object.assign(this, props)
        Object.freeze(this)
    }

    public clone(patch: Optionalized<RenderRequest<T>>): RenderRequest<T>
    {
        const permitPatch = _.pick(patch, RenderRequest._permitKeys)
        return new RenderRequest<T>(Object.assign({}, this, permitPatch))
    }

    public toPreRenderingRequest(): PreRenderingRequest<T>
    {
        return new PreRenderingRequest<T>({
            width: this.width,
            height: this.height,
            framerate: this.framerate,
            durationFrames: this.durationFrames,

            samplingRate: this.samplingRate,
            audioBufferSize: this.neededSamples,
            audioChannels: this.audioChannels,

            rootComposition: this.rootComposition,
            parentComposition: this.parentComposition,

            parameters: this.parameters,

            resolver: this.resolver,
        })
    }
}
