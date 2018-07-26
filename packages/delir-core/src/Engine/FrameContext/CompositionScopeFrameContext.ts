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

    constructor(props: CompositionScopeFrameContextProps) {
        Object.assign(this, props)
    }
}
