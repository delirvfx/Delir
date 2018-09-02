import TimePixelConversion from './TimePixelConversion'

describe('TimePixelConversion', () => {
    describe('#frameToPixel', () => {
        // formula:
        // framePerPixel = pixelPerSec / framerate
        // pixel = inputFrame * framePerPixel * scale

        it('Should returns correct value: 0', () => {
            const actual1 = TimePixelConversion.framesToPixel({
                durationFrames: 0,
                framerate: 30,
                pxPerSec: 30,
                scale: 1,
            })

            const actual2 = TimePixelConversion.framesToPixel({
                durationFrames: 0,
                framerate: 60,
                pxPerSec: 30,
                scale: 1,
            })

            const actual3 = TimePixelConversion.framesToPixel({
                durationFrames: 0,
                framerate: 30,
                pxPerSec: 30,
                scale: 2,
            })

            expect(actual1).toBe(0)
            expect(actual2).toBe(0)
            expect(actual3).toBe(0)
        })

        it('Should returns correc value with `durationFrames', () => {
            const actual1 = TimePixelConversion.framesToPixel({
                durationFrames: 20,
                framerate: 30,
                pxPerSec: 30,
                scale: 1,
            })

            const actual2 = TimePixelConversion.framesToPixel({
                durationFrames: -20,
                framerate: 60,
                pxPerSec: 30,
                scale: 1,
            })

            // frame * (pixelPerSec / framerate) * scale
            expect(actual1).toBe(20 * (30 / 30) * 1)
            expect(actual2).toBe(-(20 * (30 / 60) * 1))
        })

        it('Should returns correc value with `framerate`', () => {
            const actual = TimePixelConversion.framesToPixel({
                durationFrames: 1,
                framerate: 60,
                pxPerSec: 30,
                scale: 1,
            })

            // frame * (pixelPerSec / framerate) * scale
            expect(actual).toBe(1 * (30 / 60) * 1)
        })

        it('Should returns correc value with `pxPerSec`', () => {
            const actual = TimePixelConversion.framesToPixel({
                durationFrames: 1,
                framerate: 30,
                pxPerSec: 40,
                scale: 1,
            })

            // frame * (pixelPerSec / framerate) * scale
            expect(actual).toBe(1 * (40 / 30) * 1)
        })

        it('Should returns correc value with `scale`', () => {
            const actual = TimePixelConversion.framesToPixel({
                durationFrames: 1,
                framerate: 30,
                pxPerSec: 30,
                scale: 2,
            })

            // frame * (pixelPerSec / framerate) * scale
            expect(actual).toBe(1 * (30 / 30) * 2)
        })

        it('Should returns correc value with complex params', () => {
            const actual = TimePixelConversion.framesToPixel({
                durationFrames: 45,
                framerate: 60,
                pxPerSec: 42,
                scale: 2.4,
            })

            // frame * (pixelPerSec / framerate) * scale
            expect(actual).toBe(45 * (42 / 60) * 2.4)
        })
    })

    describe('#pixelToFrames', () => {
        // formula:
        // framePerPixel = pixelPerSec / framerate
        // frame = (inputPixel / scale) * framePerPixel

        it('Should returns correct value: 0', () => {
            const actual1 = TimePixelConversion.pixelToFrames({
                pixel: 0,
                framerate: 30,
                pxPerSec: 30,
                scale: 1,
            })

            const actual2 = TimePixelConversion.pixelToFrames({
                pixel: 0,
                framerate: 60,
                pxPerSec: 30,
                scale: 1,
            })

            const actual3 = TimePixelConversion.pixelToFrames({
                pixel: 0,
                framerate: 30,
                pxPerSec: 30,
                scale: 2,
            })

            expect(actual1).toBe(0)
            expect(actual2).toBe(0)
            expect(actual3).toBe(0)
        })

        it('Should returns correct value with `pixels', () => {
            const actual = TimePixelConversion.pixelToFrames({
                pixel: 20,
                framerate: 30,
                pxPerSec: 30,
                scale: 1,
            })

            // (pixel / scale) * (pixelPerSec / framerate)
            expect(actual).toBe(Math.round((20 / 1) * (30 / 30)))
        })

        it('Should returns correct value with `framerate`', () => {
            const actual = TimePixelConversion.pixelToFrames({
                pixel: 1,
                framerate: 60,
                pxPerSec: 30,
                scale: 1,
            })

            // (pixel / scale) * (pixelPerSec / framerate)
            expect(actual).toBe(Math.round((1 / 1) * (30 / 60)))
        })

        it('Should returns correct value with `pxPerSec`', () => {
            const actual = TimePixelConversion.pixelToFrames({
                pixel: 1,
                framerate: 30,
                pxPerSec: 45,
                scale: 1,
            })

            // (pixel / scale) * (pixelPerSec / framerate)
            expect(actual).toBe(Math.round((1 / 1) * (45 / 30)))
        })

        it('Should returns correct value with `scale`', () => {
            const actual = TimePixelConversion.pixelToFrames({
                pixel: 1,
                framerate: 30,
                pxPerSec: 35,
                scale: 2,
            })

            // (pixel / scale) * (pixelPerSec / framerate)
            expect(actual).toBe(Math.round((1 / 2) * (35 / 30)))
        })

        it('Should returns correct value with complex params', () => {
            const actual = TimePixelConversion.pixelToFrames({
                pixel: 13,
                framerate: 60,
                pxPerSec: 45,
                scale: 2.2,
            })

            // (pixel / scale) * (pixelPerSec / framerate)
            expect(actual).toBe(Math.round((13 / 2.2) * (45 / 60)))
        })

        it('Should returns integer (not float)', () => {
            // There is no concept of decimal in the number of frames

            const actual = TimePixelConversion.pixelToFrames({
                pixel: 13,
                framerate: 60,
                pxPerSec: 45,
                scale: 2.2,
            })

            expect(actual).toBe(actual | 0)
        })
    })

    describe('#secondsToPx', () => {
        // formula:
        // secondsPerPixel = pixelPerSecond / framePerSecond
        // pixel = secondPerPixel * inputSeconds * scale

        it('Should returns correct value: 0', () => {
            const actual1 = TimePixelConversion.secondsToPx({
                seconds: 0,
                framerate: 30,
                pxPerSec: 30,
                scale: 1,
            })

            const actual2 = TimePixelConversion.secondsToPx({
                seconds: 0,
                framerate: 60,
                pxPerSec: 30,
                scale: 1,
            })

            const actual3 = TimePixelConversion.secondsToPx({
                seconds: 0,
                framerate: 30,
                pxPerSec: 60,
                scale: 1,
            })

            const actual4 = TimePixelConversion.secondsToPx({
                seconds: 0,
                framerate: 30,
                pxPerSec: 30,
                scale: 2,
            })

            expect(actual1).toBe(0)
            expect(actual2).toBe(0)
            expect(actual3).toBe(0)
            expect(actual4).toBe(0)
        })

        it('Should returns correct value with `seconds`', () => {
            const actual = TimePixelConversion.secondsToPx({
                seconds: 20,
                framerate: 30,
                pxPerSec: 30,
                scale: 1,
            })

            // (pps / framerate) * inputSeconds * scale
            expect(actual).toBe((30 / 30) * 20 * 1)
        })

        it('Should returns correct value with `framerate`', () => {
            const actual = TimePixelConversion.secondsToPx({
                seconds: 1,
                framerate: 60,
                pxPerSec: 30,
                scale: 1,
            })

            // (pps / framerate) * inputSeconds * scale
            expect(actual).toBe((30 / 60) * 1 * 1)
        })

        it('Should returns correct value with `pxPerSec`', () => {
            const actual = TimePixelConversion.secondsToPx({
                seconds: 1,
                framerate: 30,
                pxPerSec: 60,
                scale: 1,
            })

            // (pps / framerate) * inputSeconds * scale
            expect(actual).toBe((60 / 30) * 1 * 1)
        })

        it('Should returns correct value with `scale`', () => {
            const actual = TimePixelConversion.secondsToPx({
                seconds: 1,
                framerate: 30,
                pxPerSec: 30,
                scale: 2,
            })

            // (pps / framerate) * inputSeconds * scale
            expect(actual).toBe((30 / 30) * 1 * 2)
        })

        it('Should returns correct value with complex param', () => {
            const actual = TimePixelConversion.secondsToPx({
                seconds: 45.3,
                framerate: 60,
                pxPerSec: 45,
                scale: 2.3,
            })

            // (pps / framerate) * inputSeconds * scale
            expect(actual).toBe((45 / 60) * 45.3 * 2.3)
        })
    })

    describe('#pxToSeconds', () => {
        // formula:
        //  pixelPerFrame = framePerSecond / pixelPerSecond
        //  seconds = pixel * pixelPerFrame * scale

        it('Should returns correct value: 0', () => {
            const actual1 = TimePixelConversion.pxToSeconds({
                pixel: 0,
                framerate: 30,
                pxPerSec: 30,
                scale: 1,
            })

            const actual2 = TimePixelConversion.pxToSeconds({
                pixel: 0,
                framerate: 60,
                pxPerSec: 30,
                scale: 1,
            })

            const actual3 = TimePixelConversion.pxToSeconds({
                pixel: 0,
                framerate: 30,
                pxPerSec: 60,
                scale: 1,
            })

            const actual4 = TimePixelConversion.pxToSeconds({
                pixel: 0,
                framerate: 30,
                pxPerSec: 30,
                scale: 2,
            })

            expect(actual1).toBe(0)
            expect(actual2).toBe(0)
            expect(actual3).toBe(0)
            expect(actual4).toBe(0)
        })

        it('Should returns correct value with `pixel`', () => {
            const actual = TimePixelConversion.pxToSeconds({
                pixel: 14,
                framerate: 30,
                pxPerSec: 30,
                scale: 1,
            })

            // px * (framerate / pps) * scale
            expect(actual).toBe(14 * (30 / 30) * 1)
        })

        it('Should returns correct value with `framerate`', () => {
            const actual = TimePixelConversion.pxToSeconds({
                pixel: 1,
                framerate: 60,
                pxPerSec: 30,
                scale: 1,
            })

            // px * (framerate / pps) * scale
            expect(actual).toBe(1 * (60 / 30) * 1)
        })

        it('Should returns correct value with `pxPerSec`', () => {
            const actual = TimePixelConversion.pxToSeconds({
                pixel: 1,
                framerate: 30,
                pxPerSec: 60,
                scale: 1,
            })

            // px * (framerate / pps) * scale
            expect(actual).toBe(1 * (30 / 60) * 1)
        })

        it('Should returns correct value with `scale`', () => {
            const actual = TimePixelConversion.pxToSeconds({
                pixel: 1,
                framerate: 30,
                pxPerSec: 30,
                scale: 2,
            })

            // px * (framerate / pps) * scale
            expect(actual).toBe(1 * (30 / 30) * 2)
        })

        it('Should returns correct value with complex param', () => {
            const actual = TimePixelConversion.pxToSeconds({
                pixel: 132,
                framerate: 60,
                pxPerSec: 45,
                scale: 3.5,
            })

            // px * (framerate / pps) * scale
            expect(actual).toBe(132 * (60 / 45) * 3.5)
        })
    })

    describe('#buildMeasures', () => {
        it('Should works without any Error', () => {
            TimePixelConversion.buildMeasures({
                durationFrames: 1000,
                framerate: 60,
                maxMeasures: 100,
                placeIntervalWidth: 30,
                pxPerSec: 30,
                scale: 1,
            })
        })
    })
})
