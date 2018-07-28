import CompositionScopeFrameContext from './CompositionScopeFrameContext'

interface LayerScopeFrameContextProps {}

export default class LayerScopeFrameContext extends CompositionScopeFrameContext {
    constructor(
        compositionScope: CompositionScopeFrameContext,
        props: LayerScopeFrameContextProps = {}
    ) {
        super(compositionScope)
        Object.assign(this, props)
    }
}
