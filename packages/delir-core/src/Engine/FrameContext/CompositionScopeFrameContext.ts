export interface CompositionScopeFrameContextProps {
    width: number
    height: number

    framerate: number
    durationFrames: number

    samplingRate: number
    audioChannels: number

    time: number
    timeOnComposition: number

    frame: number
    frameOnComposition: number
}

export default class CompositionScopeFrameContext {
    public width: number
    public height: number

    public framerate: number
    public durationFrames: number

    public samplingRate: number
    public audioChannels: number

    public time: number
    public timeOnComposition: number

    public frame: number
    public frameOnComposition: number

    constructor(props: CompositionScopeFrameContextProps) {
        Object.assign(this, props)
    }
}
