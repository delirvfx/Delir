import ColorRGB from '../../Values/color-rgb'
import ColorRGBA from '../../Values/color-rgba'
import Keyframe from '../keyframe'

import assign from '../../__spec__/Utils/assign'

describe('Keyframe', () => {
    const baseParam = Object.freeze({ easeInParam: [1, 1] as [number, number], easeOutParam: [1, 1] as [number, number], frameOnClip: 0, value: null })

    it('Should correct toJSON / fromJSON with number value', () => {
        const numberKf = assign(new Keyframe(), { ...baseParam, value: 1 })
        const expected = { id: numberKf.id, config: { ...baseParam, value: 1 } }

        expect(numberKf.toJSON()).to.eql(expected)
        expect(Keyframe.deserialize(numberKf.toJSON()).toJSON()).to.eql(expected)
    })

    it('Should correct toJSON / fromJSON with boolean value', () => {
        const booleanKf = assign(new Keyframe(), { ...baseParam, value: 1 })
        const expected = { id: booleanKf.id , config: { ...baseParam, value: true } }

        expect(booleanKf.toJSON()).to.eql(expected)
        expect(Keyframe.deserialize(booleanKf.toJSON()).toJSON()).to.eql(expected)
    })

    it('Should correct toJSON / fromJSON with string value', () => {
        const stringKf = assign(new Keyframe(), { ...baseParam, value: 'string' })
        const expected = { id: stringKf.id, config: { ...baseParam, value: 'string' } }

        expect(stringKf.toJSON()).to.eql(expected)
        expect(Keyframe.deserialize(stringKf.toJSON()).toJSON()).to.eql(expected)
    })

    it('Should correct toJSON / fromJSON with AssetPointer value', () => {
        const assetKf = assign(new Keyframe(), { ...baseParam, value: { assetId: 'asset-id' } })
        const expected = { id: assetKf.id, config: { ...baseParam, value: { type: 'asset', value: { assetId: 'asset-id' } } } }

        expect(assetKf.toJSON()).to.eql(expected)
        expect(Keyframe.deserialize(assetKf.toJSON()).toJSON()).to.eql(expected)
    })

    it('Should correct toJSON / fromJSON with ColorRGB value', () => {
        const assetKf = assign(new Keyframe(), { ...baseParam, value: new ColorRGB(0, 1, 2) })
        const expected = { id: assetKf.id, config: { ...baseParam, value: { type: 'color-rgb', value: { red: 0, green: 1, blue: 2 } } } }

        expect(assetKf.toJSON()).to.eql(expected)

        const restoredKf = Keyframe.deserialize(assetKf.toJSON())
        expect(restoredKf.toJSON()).to.eql(expected)
        expect(restoredKf.value).to.eql(new ColorRGB(0, 1, 2))
    })

    it('Should correct toJSON / fromJSON with ColorRGBA value', () => {
        const assetKf = assign(new Keyframe(), { ...baseParam, value: new ColorRGBA(0, 1, 2, 3) })
        const expected = { id: assetKf.id, config: { ...baseParam, value: { type: 'color-rgba', value: { red: 0, green: 1, blue: 2, alpha: 3 } } } }

        expect(assetKf.toJSON()).to.eql(expected)

        const restoredKf = Keyframe.deserialize(assetKf.toJSON())
        expect(restoredKf.toJSON()).to.eql(expected)
        expect(restoredKf.value).to.eql(new ColorRGBA(0, 1, 2, 3))
    })

    it('Should failed fromJSON with unexpected input', () => {
        expect(() => {
            Keyframe.deserialize({
                id: 'kfid',
                config: {
                    ...baseParam,
                    value: {
                        type: 'あたまわるわる〜',
                        value: '✌(´◓ｑ◔｀)✌'
                    } as any
                }
            })
        }).throwError()
    })
})
