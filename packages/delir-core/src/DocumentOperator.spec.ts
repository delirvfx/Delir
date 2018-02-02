import {} from 'jest'
import { mockNewProject } from '../test_lib/mock'
import DocumentOperator from './DocumentOperator'

describe('DocumentOperator', () => {
    let docOp: DocumentOperator

    describe('Asset operations', () => {
        it.skip('#getAsset', () => { })

        it('#addAsset', () => {
            const p = mockNewProject()
            const docOp = new DocumentOperator({} as any, p)

            docOp.addAsset({ fileType: 'jpeg', name: 'photo', path: '/Users/Test' })

            // Correctry inserted?
            expect(p.assets).toHaveLength(1)

            // Is ID were generated?
            expect(typeof p.assets[0].id).toBe('string')
        })

        it('#removeAsset', () => {
            const p = mockNewProject()
            docOp = new DocumentOperator({} as any, p)

            const asset = docOp.addAsset({ fileType: 'jpeg', name: 'photo', path: '/Users/Test' })
            docOp.removeAsset(asset.id)

            // Correctry removed?
            expect(p.assets).toHaveLength(0)
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
