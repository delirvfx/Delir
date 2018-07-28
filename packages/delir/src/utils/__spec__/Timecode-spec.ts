import { frameToTimeCode } from '../Timecode'

describe('Timecode', () => {
    describe('#frameToTimecode', () => {
        it('30fps', () => {
            const FPS = 30
            expect(frameToTimeCode(0, FPS)).to.be('00:00:00:00')
            expect(frameToTimeCode(FPS - 1, FPS)).to.be('00:00:00:29')
            expect(frameToTimeCode(FPS, FPS)).to.be('00:00:01:00')
            expect(frameToTimeCode(FPS * 60 - 1, FPS)).to.be('00:00:59:29')
            expect(frameToTimeCode(FPS * 60, FPS)).to.be('00:01:00:00')
            expect(frameToTimeCode(FPS * 60 * 60 - 1, FPS)).to.be('00:59:59:29')
            expect(frameToTimeCode(FPS * 60 * 60, FPS)).to.be('01:00:00:00')
        })

        it('60fps', () => {
            const FPS = 60
            expect(frameToTimeCode(0, FPS)).to.be('00:00:00:00')
            expect(frameToTimeCode(FPS - 1, FPS)).to.be('00:00:00:59')
            expect(frameToTimeCode(FPS, FPS)).to.be('00:00:01:00')
            expect(frameToTimeCode(FPS * 60 - 1, FPS)).to.be('00:00:59:59')
            expect(frameToTimeCode(FPS * 60, FPS)).to.be('00:01:00:00')
            expect(frameToTimeCode(FPS * 60 * 60 - 1, FPS)).to.be('00:59:59:59')
            expect(frameToTimeCode(FPS * 60 * 60, FPS)).to.be('01:00:00:00')
        })
    })
})
