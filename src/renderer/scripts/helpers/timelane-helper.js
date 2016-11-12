// @flow

export default class TimelaneHelper
{
    /**
     * Transform frames to Pixel per Seconds
     */
    static framesToPixel({
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
    }

    /**
     * Transform Pixel to frames
     */
    static pixelToFrames({
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
    }


    static secondsToPx({
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
    }

    static pxToSeconds({
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
    }
}
