import {} from 'jest'
import { mockAsset, mockClip, mockLayer, mockProject } from '../test_lib/mock'
import DocumentOperator from './DocumentOperator'

describe('DocumentOperator', () => {
    describe('Asset operations', () => {
        it.skip('#getAsset', () => { })

        it('#addAsset', () => {
            const p = mockProject()
            const docOp = new DocumentOperator({} as any, p)
            docOp.addAsset(mockAsset())

            // Correctry inserted?
            expect(p.assets).toHaveLength(1)

            // Is ID were generated?
            expect(typeof p.assets[0].id).toBe('string')
        })

        it('#addAsset should emits "asset:add" event', () => {
            const p = mockProject()
            const docOp = new DocumentOperator({} as any, p)

            const spyFn = jest.fn()
            docOp.on('asset:add', spyFn)
            const asset = docOp.addAsset(mockAsset())

            expect(spyFn.mock.calls).toHaveLength(1)
            expect(spyFn.mock.calls[0][0]).toEqual({ id: asset.id })
        })

        it('#removeAsset should remove specified Asset', () => {
            const p = mockProject()
            const docOp = new DocumentOperator({} as any, p)

            const asset = docOp.addAsset({ fileType: 'jpeg', name: 'photo', path: '/Users/Test' })
            docOp.removeAsset(asset.id)

            // Correctry removed?
            expect(p.assets).toHaveLength(0)
        })

        it('#addAsset should emits "asset:remove" event', () => {
            const p = mockProject()
            const docOp = new DocumentOperator({} as any, p)
            const spyFn = jest.fn()

            docOp.on('asset:remove', spyFn)
            const asset = docOp.addAsset(mockAsset())
            docOp.removeAsset(asset.id)

            expect(spyFn.mock.calls).toHaveLength(1)
            expect(spyFn.mock.calls[0][0]).toEqual({ id: asset.id })
        })
    })

    describe('Composition operations', () => {
        it.skip('#getComposition', () => { })
        it.skip('#removeComposition', () => { })
    })

    describe('Layer operations', () => {
        it.skip('#getLayer', () => { })

        it('#removeLayer should remove specified Layer', () => {
            const layers = [  mockLayer({ id: 'mocked-layer' }) ]
            const p = mockProject({ layers })
            const docOp = new DocumentOperator({} as any, p)

            docOp.removeLayer('mocked-layer')

            expect(p.layers).toHaveLength(0)
         })

        it('#removeLayer should emits "layer:remove" event', () => {
            const layers = [  mockLayer({ id: 'mocked-layer' }) ]
            const p = mockProject({ layers })
            const docOp = new DocumentOperator({} as any, p)

            const spyFn = jest.fn()
            docOp.on('layer:remove', spyFn)
            docOp.removeLayer('mocked-layer')

            expect(spyFn.mock.calls).toHaveLength(1)
            expect(spyFn.mock.calls[0][0]).toEqual({ id: 'mocked-layer' })
         })
    })

    describe('Clip operations', () => {
        it.skip('#getClip', () => { })

        it.skip('#addClip', () => { })

        it('#removeClip', () => {
            const clips = [ mockClip({ id: 'mocked-clip' }) ]
            const layers = [ mockLayer({ id: 'mocked-layer', clips: [ clips[0].id ] })]
            const p = mockProject({ layers, clips })

            const docOp = new DocumentOperator({} as any, p)
            const clip = docOp.removeClip('mocked-clip')

            expect(clip).toEqual(expect.anything())
            expect(p.clips).toHaveLength(0)
        })

        it('#removeClip should emits "clip:remove" event', () => {
            const clips = [ mockClip({ id: 'mocked-clip' }) ]
            const layers = [ mockLayer({ id: 'mocked-layer', clips: [ clips[0].id ] })]
            const p = mockProject({ layers, clips })

            const spyFn = jest.fn()
            const docOp = new DocumentOperator({} as any, p)
            docOp.on('clip:remove', spyFn)
            docOp.removeClip('mocked-clip')

            expect(spyFn.mock.calls).toHaveLength(1)
            expect(spyFn.mock.calls[0][0]).toEqual({
                id: 'mocked-clip',
                parentLayerId: 'mocked-layer',
            })
        })
    })

    describe('Effect operations', () => {
        it.skip('#getEffect', () => { })
    })
})
