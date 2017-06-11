import RenderingRequest from './render-request'
import {Clip} from '../../project'
import {ParameterValueTypes} from '../../plugin-support/type-descriptor'

export interface Exposes {
    req: RenderingRequest
    clipProperties: {[propName: string]: ParameterValueTypes}
    currentValue: any
}

export const makeContext = (exposes: Exposes) => {
    const clipPropertyProxy = new Proxy(exposes.clipProperties, {
        set: () => { throw new Error(`Illegal property setting in expression`) }
    })

    return {
        console,
        get time() { return exposes.req.time },
        get frame() { return exposes.req.frame },
        get timeOnComposition() { return exposes.req.timeOnComposition },
        get frameOnComposition() { return exposes.req.frameOnComposition },
        get width() { return exposes.req.width },
        get height() { return exposes.req.height },
        get audioBuffer() { return exposes.req.destAudioBuffer },
        get duration() { return exposes.req.durationFrames / exposes.req.framerate },
        get durationFrames() { return exposes.req.durationFrames },
        get clipProp() { return clipPropertyProxy },
        get currentValue() { return exposes.currentValue },
    }
}

export const expressionContextTypeDefinition = `
interface Clip {}

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
