import { mockClip, mockComposition, mockLayer, mockProject } from '../../test_lib/mock'
import Delir from '../Delir'
import DocumentOperator, { OperationEvents } from '../DocumentOperator'
import DocumentChangeApplyer from './DocumentChangeApplyer'

describe('DocumentChangeApplyer', () => {
    let applyer: DocumentChangeApplyer
    let docOp: DocumentOperator

    beforeEach(() => {
        const ctx = new Delir()

        const p = mockProject({
            compositions: [
                mockComposition({
                    id: 'mocked-composition',
                    layers: [ 'mocked-layer' ],
                }),
            ],
            layers: [
                mockLayer({
                    id: 'mocked-layer',
                    clips: [ 'mocked-clip' ],
                }),
            ],
            clips: [
                mockClip({ id: 'mocked-clip' }),
            ],
        })

        ctx.setProject(p)
        ctx.engine.mountComponents('mocked-composition')

        docOp = ctx.project
        applyer = ctx.documentChangeApplyer
    })

    it.skip('#handleAssetAdd', () => {})

    it.skip('#handleRemoveAsset', () => {})

    it.skip('#handleAddComposition', () => {})

    it('#handleRemoveComposition should executes CompositionComponent#deactivate', () => {
        const spyFn = jest.fn()
        applyer.treeRoot.deactivate = spyFn

        const result = applyer.handleRemoveComposition({ id: 'mocked-composition' } as OperationEvents['composition:remove'])

        expect(result).toBeInstanceOf(Promise)
        expect(spyFn.mock.calls).toHaveLength(1)
    })

    it.skip('#handleAddLayer', () => {})

    it('#handleRemoveLayer should executes LayerComponent#deactivate', () => {
        const spyFn = jest.fn()
        applyer.treeRoot.composition.layers[0].deactivate = spyFn

        const result = applyer.handleRemoveLayer({ id: 'mocked-layer' } as OperationEvents['layer:remove'])

        expect(result).toBeInstanceOf(Promise)
        expect(spyFn.mock.calls).toHaveLength(1)
    })

    it.skip('#handleAddClip', () => {})

    it.skip('#handleRemoveClip', () => {})

    it.skip('#handleAddEffect', () => {})

    it.skip('#handleRemoveEffect', () => {})
})
