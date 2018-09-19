import { ParameterValueTypes } from '../../PluginSupport/type-descriptor'
import RenderingRequest from '../RenderContext'
import { ExpressionContext } from './ExpressionVM'

export interface ContextSource {
    req: RenderingRequest
    clipProperties: {[propName: string]: ParameterValueTypes}
    currentValue: any
}

export const buildContext = (contextSource: ContextSource): ExpressionContext => {
    const clipPropertyProxy = new Proxy(contextSource.clipProperties, {
        set: () => { throw new Error('Illegal property setting in expression') }
    })

    return {
        time                : contextSource.req.time,
        frame               : contextSource.req.frame,
        timeOnComposition   : contextSource.req.timeOnComposition,
        frameOnComposition  : contextSource.req.frameOnComposition,
        width               : contextSource.req.width,
        height              : contextSource.req.height,
        audioBuffer         : contextSource.req.destAudioBuffer,
        duration            : contextSource.req.durationFrames / contextSource.req.framerate,
        durationFrames      : contextSource.req.durationFrames,
        clipProp            : clipPropertyProxy,
        currentValue        : contextSource.currentValue,
    }
}

export const expressionContextTypeDefinition = `
declare const ctx: {
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
