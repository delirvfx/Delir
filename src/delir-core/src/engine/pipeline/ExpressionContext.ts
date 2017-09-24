import RenderingRequest from './render-request'
import {ParameterValueTypes} from '../../plugin-support/type-descriptor'

export interface ClipBound {
    x: number
    y: number
    width: number
    height: number
    rotate: number
}

export interface Exposes {
    req: RenderingRequest
    clipProperties: {[propName: string]: ParameterValueTypes}
    currentValue: any
    clipBound: ClipBound
}

export const makeContext = (exposes: Exposes) => {
    const clipPropertyProxy = new Proxy(exposes.clipProperties, {
        set: () => { throw new Error(`Illegal property setting in expression`) }
    })

    const PROP_PROXIES = {
        time                : {enumerable: true, get: () => exposes.req.time },
        frame               : {enumerable: true, get: () => exposes.req.frame },
        timeOnComposition   : {enumerable: true, get: () => exposes.req.timeOnComposition },
        frameOnComposition  : {enumerable: true, get: () => exposes.req.frameOnComposition },
        width               : {enumerable: true, get: () => exposes.req.width },
        height              : {enumerable: true, get: () => exposes.req.height },
        audioBuffer         : {enumerable: true, get: () => exposes.req.destAudioBuffer },
        duration            : {enumerable: true, get: () => exposes.req.durationFrames / exposes.req.framerate },
        durationFrames      : {enumerable: true, get: () => exposes.req.durationFrames },
        clipProp            : {enumerable: true, get: () => clipPropertyProxy },
        currentValue        : {enumerable: true, get: () => exposes.currentValue },
    }

    const expressionContext = {}
    Object.defineProperties(expressionContext, PROP_PROXIES)

    const context = {}
    Object.defineProperties(context, PROP_PROXIES)
    Object.defineProperties(context, {
        console : {get: () => console},
        ctx     : {get: () => expressionContext},
    })

    return context
}

export const expressionContextTypeDefinition = `
interface ClipBound {
    x: number
    y: number
    width: number
    height: number
    rotate: number
}

declare const ctx: {
    time: number
    time: number
    frame: number
    timeOnComposition: number
    frameOnComposition: number
    width: number
    height: number
    audioBuffer: Float32Array[]
    duration: number
    durationFrames: number
    clipProp: {[propertyName: string]: any}
    currentValue: any
    clipBound: ClipBound
}

declare const time: number;
declare const time: number;
declare const frame: number;
declare const timeOnComposition: number;
declare const frameOnComposition: number;
declare const width: number;
declare const height: number;
declare const audioBuffer: Float32Array[];
declare const duration: number;
declare const durationFrames: number;
declare const clipProp: {[propertyName: string]: any};
declare const currentValue: any;
`
