import LayerScopeFrameContext from './LayerScopeFrameContext'

interface ClipScopeContextProps {
    readonly timeOnClip: number
    readonly frameOnClip: number
}

export default class ClipScopeFrameContext extends LayerScopeFrameContext {
    public readonly timeOnClip: number
    public readonly frameOnClip: number

    constructor(
        layerScope: LayerScopeFrameContext,
        props: ClipScopeContextProps
    ) {
        super(layerScope, props)
        Object.assign(this, layerScope, props)
    }
}
