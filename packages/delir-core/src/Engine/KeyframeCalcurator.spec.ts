import { Keyframe } from '../Entity'
import Type from '../PluginSupport/type-descriptor'
import * as KeyframeHelper from './KeyframeCalcurator'

describe('KeyframeHelper', () => {
    describe('test #calcKeyframe via #calcKeyframeValueAt', () => {
        const clipPlacedFrame = 0

        describe('String keyframe', () => {
            let mockDesc
            let sequence

            beforeEach(() => {
                mockDesc = Type.string('string', { label: 'String' })
                sequence = {
                    string: [
                        new Keyframe({ frameOnClip: 10, value: 'ABC' }),
                        new Keyframe({ frameOnClip: 50, value: 'DEF' }),
                        new Keyframe({ frameOnClip: 100, value: 'XYZ' }),
                    ]
                }
            })

            it('Before first keyframe', () => {
                const actual = KeyframeHelper.calcKeyframeValuesAt(0, clipPlacedFrame, mockDesc, sequence).string
                expect(actual).toBe('ABC')
            })

            it('On first keyframe', () => {
                const actual = KeyframeHelper.calcKeyframeValuesAt(/* first kf position */ 10, clipPlacedFrame, mockDesc, sequence).string
                expect(actual).toBe('ABC')
            })

            it('On before second keyframe', () => {
                const actual = KeyframeHelper.calcKeyframeValuesAt(/* before second kf position */ 49, clipPlacedFrame, mockDesc, sequence).string
                expect(actual).toBe('ABC')
            })

            it('On second keyframe', () => {
                const actual = KeyframeHelper.calcKeyframeValuesAt(/* second kf position */ 50, clipPlacedFrame, mockDesc, sequence).string
                expect(actual).toBe('DEF')
            })

            it('On after second keyframe', () => {
                const actual = KeyframeHelper.calcKeyframeValuesAt(/* after second kf position */ 51, clipPlacedFrame, mockDesc, sequence).string
                expect(actual).toBe('DEF')
            })

            it('On last keyframe', () => {
                const actual = KeyframeHelper.calcKeyframeValuesAt(/* last kf position */ 100, clipPlacedFrame, mockDesc, sequence).string
                expect(actual).toBe('XYZ')
            })

            it('After last keyframe', () => {
                const actual = KeyframeHelper.calcKeyframeValuesAt(/* after last kf position */ 101, clipPlacedFrame, mockDesc, sequence).string
                expect(actual).toBe('XYZ')
            })
        })
    })
})
