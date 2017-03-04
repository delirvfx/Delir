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
        pxPerSec: number,
        framerate: number,
        durationFrames: number,
        scale: number,
    }) {
        return (durationFrames / framerate) * pxPerSec * (scale || 1)
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
        pxPerSec: number,
        framerate: number,
        pixel: number,
        scale: number,
    }) {
        return (pixel / (scale || 1)) / pxPerSec  * framerate
    },


    secondsToPx({
        pxPerSec,
        seconds,
        scale,
    }: {
        pxPerSec: number,
        framerate: number,
        seconds: number,
        scale: number,
    }) {
        return seconds * pxPerSec * (scale || 1)
    },

    pxToSeconds({
        pxPerSec,
        pixel,
        scale,
    }: {
        pxPerSec: number,
        framerate: number,
        pixel: number,
        scale: number,
    }) {
        return pixel / (scale || 1) / pxPerSec
    },
}
