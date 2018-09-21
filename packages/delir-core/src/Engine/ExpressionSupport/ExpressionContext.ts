import { ParameterValueTypes } from '../../PluginSupport/type-descriptor'
import RenderContext from '../RenderContext'
import { ExpressionContext } from './ExpressionVM'

export interface ContextSource {
    context: RenderContext
    clipProperties: {[propName: string]: ParameterValueTypes}
    currentValue: any
}

export const buildContext = (contextSource: ContextSource): ExpressionContext => {
    const clipPropertyProxy = new Proxy(contextSource.clipProperties, {
        set: () => { throw new Error('Illegal property setting in expression') }
    })

    return {
        time                : contextSource.context.time,
        frame               : contextSource.context.frame,
        timeOnComposition   : contextSource.context.timeOnComposition,
        frameOnComposition  : contextSource.context.frameOnComposition,
        width               : contextSource.context.width,
        height              : contextSource.context.height,
        audioBuffer         : contextSource.context.destAudioBuffer,
        duration            : contextSource.context.durationFrames / contextSource.context.framerate,
        durationFrames      : contextSource.context.durationFrames,
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
