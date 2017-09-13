import Type from '../../plugin-support/type-descriptor'
import Keyframe from '../../project/keyframe'
import * as KeyframeHelper from '../keyframe-helper'

import assign from '../../__spec__/Utils/assign'

describe('KeyframeHelper', () => {
    describe('test #calcKeyframe via #calcKeyframeValueAt', () => {
        const clipPlacedFrame = 0

        describe('String keyframe', () => {
            let mockDesc
            let sequence

            before(() => {
                mockDesc = Type.string('string', { label: 'String' })
                sequence = {
                    string: [
                        assign(new Keyframe(), { frameOnClip: 10, value: 'ABC' }),
                        assign(new Keyframe(), { frameOnClip: 50, value: 'DEF' }),
                        assign(new Keyframe(), { frameOnClip: 100, value: 'XYZ' }),
                    ]
                }
            })

            it('Before first keyframe', () => {
                const actual = KeyframeHelper.calcKeyframeValuesAt(0, clipPlacedFrame, mockDesc, sequence).string
                expect(actual).to.be('ABC')
            })

            it('On first keyframe', () => {
                const actual = KeyframeHelper.calcKeyframeValuesAt(/* first kf position */ 10, clipPlacedFrame, mockDesc, sequence).string
                expect(actual).to.be('ABC')
            })

            it('On before second keyframe', () => {
                const actual = KeyframeHelper.calcKeyframeValuesAt(/* before second kf position */ 49, clipPlacedFrame, mockDesc, sequence).string
                expect(actual).to.be('ABC')
            })

            it('On second keyframe', () => {
                const actual = KeyframeHelper.calcKeyframeValuesAt(/* second kf position */ 50, clipPlacedFrame, mockDesc, sequence).string
                expect(actual).to.be('DEF')
            })

            it('On after second keyframe', () => {
                const actual = KeyframeHelper.calcKeyframeValuesAt(/* after second kf position */ 51, clipPlacedFrame, mockDesc, sequence).string
                expect(actual).to.be('DEF')
            })

            it('On last keyframe', () => {
                const actual = KeyframeHelper.calcKeyframeValuesAt(/* last kf position */ 100, clipPlacedFrame, mockDesc, sequence).string
                expect(actual).to.be('XYZ')
            })

            it('After last keyframe', () => {
                const actual = KeyframeHelper.calcKeyframeValuesAt(/* after last kf position */ 101, clipPlacedFrame, mockDesc, sequence).string
                expect(actual).to.be('XYZ')
            })
        })
    })
})
