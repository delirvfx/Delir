import ClipScopeFrameContext from './ClipScopeFrameContext'
import CompositionScopeFrameContext from './CompositionScopeFrameContext'
import LayerScopeFrameContext from './LayerScopeFrameContext'

describe('ClipScopeFrameContext', () => {
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
    let layerProps = Object.freeze({})

    let compositionScope: CompositionScopeFrameContext
    let layerScope: LayerScopeFrameContext

    beforeEach(() => {
        compositionScope = new CompositionScopeFrameContext(compositionProps)
        layerScope = new LayerScopeFrameContext(compositionScope, layerProps)
    })

    it('Should construct without errors', () => {
        new ClipScopeFrameContext(layerScope, { frameOnClip: 0, timeOnClip: 0 })
    })

    it('Should extends parent scope props', () => {
        const scope = new ClipScopeFrameContext(layerScope, { frameOnClip: 0, timeOnClip: 0 })
        expect(scope).toMatchObject({...compositionProps, ...layerProps})
    })
})
