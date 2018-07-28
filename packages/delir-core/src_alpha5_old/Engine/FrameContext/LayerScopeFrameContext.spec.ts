import CompositionScopeFrameContext from './CompositionScopeFrameContext'
import LayerScopeFrameContext from './LayerScopeFrameContext'

describe('LayerScopeFrameContext', () => {
    let compositionProps = Object.freeze({
        width: 1,
        height: 1,
        framerate: 30,
        durationFrames: 300,
        samplingRate: 48000,
        audioChannels: 2,
        time: 0,
        timeOnComposition: 0,
        frame: 0,
        frameOnComposition: 0
    })
    let compositionScope: CompositionScopeFrameContext

    beforeEach(() => {
        compositionScope = new CompositionScopeFrameContext(compositionProps)
    })

    it('Should construct without errors', () => {
        new LayerScopeFrameContext(compositionScope, {})
    })

    it('Should extends parent scope props', () => {
        const scope = new LayerScopeFrameContext(compositionScope, {})
        expect(scope).toMatchObject(compositionProps)
    })
})
