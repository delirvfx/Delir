import {} from 'jest'
import { mockAsset, mockNewProject } from '../test_lib/mock'
import DocumentOperator from './DocumentOperator'

describe('DocumentOperator', () => {
    let docOp: DocumentOperator

    describe('Asset operations', () => {
        it.skip('#getAsset', () => { })

        it('#addAsset', () => {
            const p = mockNewProject()
            const docOp = new DocumentOperator({} as any, p)
            docOp.addAsset(mockAsset())

            // Correctry inserted?
            expect(p.assets).toHaveLength(1)

            // Is ID were generated?
            expect(typeof p.assets[0].id).toBe('string')
        })

        it('#addAsset emits asset:add event', () => {
            const p = mockNewProject()
            const docOp = new DocumentOperator({} as any, p)
            const mock = jest.fn()

            docOp.on('asset:add', mock)
            const asset = docOp.addAsset(mockAsset())

            expect(mock.mock.calls.length).toBe(1)
            expect(mock.mock.calls[0][0]).toEqual({ id: asset.id })
        })

        it('#removeAsset', () => {
            const p = mockNewProject()
            docOp = new DocumentOperator({} as any, p)

            const asset = docOp.addAsset({ fileType: 'jpeg', name: 'photo', path: '/Users/Test' })
            docOp.removeAsset(asset.id)

            // Correctry removed?
            expect(p.assets).toHaveLength(0)
        })

        it('#addAsset emits asset:remove event', () => {
            const p = mockNewProject()
            const docOp = new DocumentOperator({} as any, p)
            const mock = jest.fn()

            docOp.on('asset:remove', mock)
            const asset = docOp.addAsset(mockAsset())
            docOp.removeAsset(asset.id)

            expect(mock.mock.calls.length).toBe(1)
            expect(mock.mock.calls[0][0]).toEqual({ id: asset.id })
        })
    })

    describe('Composition operations', () => {
        it.skip('#getComposition', () => { })
    })

    describe('Layer operations', () => {
        it.skip('#getLayer', () => { })
    })

    describe('Clip operations', () => {
        it.skip('#getClip', () => { })
    })

    describe('Effect operations', () => {
        it.skip('#getEffect', () => { })
    })
})
