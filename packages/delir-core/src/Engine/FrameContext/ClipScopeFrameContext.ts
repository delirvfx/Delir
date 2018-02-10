import LayerScopeFrameContext from './LayerScopeFrameContext'

interface ClipScopeContextProps {
    timeOnClip: number
    frameOnClip: number
}

export default class ClipScopeFrameContext extends LayerScopeFrameContext {
    constructor(
        layerScope: LayerScopeFrameContext,
        props: ClipScopeContextProps
    ) {
        super(layerScope, props)

        Object.assign(this, layerScope, props)
        Object.freeze(this)
    }
}
