import {} from 'jest'
import { mockClip, mockComposition, mockLayer, mockProject } from '../../test_lib/mock'
import DocumentOperator from '../DocumentOperator'
import ComponentRoot from './ComponentRoot'
import CompositionScopeFrameContext from './FrameContext/CompositionScopeFrameContext'
import TargetComponentFinder from './TargetComponentFinder'

describe('TargetComponentFinder', () => {
    let tree: ComponentRoot
    let baseFrameCtx: CompositionScopeFrameContext

    beforeEach(() => {
        const project = mockProject({
            compositions: [
                mockComposition({ id: 'mocked-composition', layers: [ 'mocked-layer-1', 'mocked-layer-2' ] }),
            ],
            layers: [
                mockLayer({ id: 'mocked-layer-1', clips: [ 'mocked-clip-1' ] }),
                mockLayer({ id: 'mocked-layer-2', clips: [ 'mocked-clip-2' ] }),
            ],
            clips: [
                mockClip({ id: 'mocked-clip-1', placedFrame: 0, durationFrames: 100 }),
                mockClip({ id: 'mocked-clip-2', placedFrame: 100, durationFrames: 100 }),
            ]
         })

        const docOp = new DocumentOperator({} as any, project)
        tree = new ComponentRoot(docOp, project.compositions[0])

        baseFrameCtx = new CompositionScopeFrameContext({
            width: 640,
            height: 360,
            frame: 0,
            frameOnComposition: 0,
            time: 0,
            timeOnComposition: 0,
            audioChannels: 2,
            samplingRate: 48000,
            durationFrames: 300,
            framerate: 30,
        })
    })

    describe('#constructor', () => {
        it('Should construct without Error', () => {
            new TargetComponentFinder(tree, baseFrameCtx)
        })
    })

    describe('#findTargetClips', () => {
        it('Should find ClipComponent at frame (with clip start frame)', () => {
            // Find clips at frame 10
            const ctx = new CompositionScopeFrameContext({...baseFrameCtx, frame: 0, frameOnComposition: 0})
            const finder = new TargetComponentFinder(tree, ctx)

            finder.findTargetClips()

            expect(finder.targets.layers).toMatchObject([ { id: 'mocked-clip-1' }, null　]) // Strict orders
        })

        it('Should find ClipComponent at frame (with clip covered frame)', () => {
            // Find clips at frame 10
            const ctx = new CompositionScopeFrameContext({...baseFrameCtx, frame: 50, frameOnComposition: 50})
            const finder = new TargetComponentFinder(tree, ctx)

            finder.findTargetClips()

            expect(finder.targets.layers).toMatchObject([ { id: 'mocked-clip-1' }, null　]) // Strict orders
        })

        it('Should not find ClipComponent at frame (with clip end frame)', () => {
            // Find clips at frame 10
            const ctx = new CompositionScopeFrameContext({...baseFrameCtx, frame: 100, frameOnComposition: 100})
            const finder = new TargetComponentFinder(tree, ctx)

            finder.findTargetClips()

            expect(finder.targets.layers).toMatchObject([ null, { id: 'mocked-clip-2' }]) // Strict orders
        })
    })
})
