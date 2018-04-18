import ClipScopeFrameContext from './ClipScopeFrameContext'

class RendererContext<P extends object = {}> {
    constructor(
        private clipScope: ClipScopeFrameContext,
        props: any // TODO: Parameter Structure
    ) {
        super(clipScope, {} as any)
        Object.assign(this, clipScope, props)
        Object.freeze(this)
    }
}

export { RendererContext as default }
