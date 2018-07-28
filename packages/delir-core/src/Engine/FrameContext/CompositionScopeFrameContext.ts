import CompositionComponent from '../Component/CompositionComponent'

export interface CompositionScopeFrameContextProps {
    readonly width: number
    readonly height: number

    readonly framerate: number
    readonly durationFrames: number

    readonly samplingRate: number
    readonly audioChannels: number

    readonly time: number
    readonly timeOnComposition: number

    readonly frame: number
    readonly frameOnComposition: number
}

export default class CompositionScopeFrameContext {
    public static buildFromComponent(component: CompositionComponent, param: { frame: number}) {
        const compContext = new CompositionScopeFrameContext()

        Object.assign(compContext, {
            width: component.ref.width,
            height: component.ref.height,
            durationFrames: component.ref.durationFrames,

            time: param.frame / component.ref.framerate,
            timeOnComposition: param.frame / component.ref.framerate,

            frame: param.frame,
            framerate: component.ref.framerate,
            frameOnComposition: param.frame,

            audioChannels: component.ref.audioChannels,
            samplingRate: component.ref.samplingRate,
        })

        return compContext
    }

    public readonly width: number
    public readonly height: number

    public readonly framerate: number
    public readonly durationFrames: number

    public readonly samplingRate: number
    public readonly audioChannels: number

    public readonly time: number
    public readonly timeOnComposition: number

    public readonly frame: number
    public readonly frameOnComposition: number
}
