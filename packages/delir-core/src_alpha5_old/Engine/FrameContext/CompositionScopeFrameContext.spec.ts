import CompositionScopeFrameContext from './CompositionScopeFrameContext'

describe('CompositionScopeFrameContext', () => {
    describe('::create', () => {
        it('Should construct without errors', () => {
            new CompositionScopeFrameContext({
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
        })
    })
})
