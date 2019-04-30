export interface RenderingStatus {
    readonly time: number
    readonly frame: number
    readonly durationFrame: number
    readonly samplingRate: number
}
export interface IRenderingStreamObserver {
    onStateChanged?: (status: RenderingStatus) => void
    onFrame?: (canvas: Readonly<HTMLCanvasElement>, status: RenderingStatus) => void
    onAudioBuffered?: (buffers: Float32Array[], status: RenderingStatus) => void
}
