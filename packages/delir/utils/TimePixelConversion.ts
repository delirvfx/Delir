export interface MeasurePoint {
    index: number
    left: number
    frameNumber: number
}

export default {
    /**
     * Transform frames to Pixel per Seconds
     */
    framesToPixel({
        pxPerSec,
        framerate,
        durationFrames,
        scale,
    }: {
        pxPerSec: number
        framerate: number
        durationFrames: number
        scale: number
    }) {
        return (durationFrames / framerate) * pxPerSec * scale
    },

    /**
     * Transform Pixel to frames
     */
    pixelToFrames({
        pxPerSec,
        framerate,
        pixel,
        scale,
    }: {
        pxPerSec: number
        framerate: number
        pixel: number
        scale: number
    }) {
        return Math.round((pixel / scale) * (pxPerSec / framerate))
    },

    secondsToPx({
        pxPerSec,
        framerate,
        seconds,
        scale,
    }: {
        pxPerSec: number
        framerate: number
        seconds: number
        scale: number
    }) {
        return seconds * (pxPerSec / framerate) * scale
    },

    pxToSeconds({
        pxPerSec,
        framerate,
        pixel,
        scale,
    }: {
        pxPerSec: number
        framerate: number
        pixel: number
        scale: number
    }) {
        return pixel * (framerate / pxPerSec) * scale
    },

    buildMeasures({
        durationFrames,
        pxPerSec,
        framerate,
        scale,
        placeIntervalWidth,
        maxMeasures,
    }: {
        durationFrames: number
        pxPerSec: number
        framerate: number
        scale: number
        placeIntervalWidth: number
        maxMeasures: number
    }): MeasurePoint[] {
        const measures = []
        let index = 0
        let previousPosision = -placeIntervalWidth

        const placeInterval = this.framesToPixel({
            pxPerSec,
            framerate,
            scale,
            durationFrames: 1,
        })

        for (let frame = 0; frame < durationFrames; frame++) {
            const position = placeInterval * frame

            if (measures.length >= maxMeasures - 1) break
            if (position - previousPosision < placeIntervalWidth) continue

            measures.push({ index, left: position, frameNumber: frame })
            previousPosision = position
            index++
        }

        measures.push({
            index,
            left: durationFrames * placeInterval,
            frameNumber: durationFrames,
        })
        return measures
    },
}
