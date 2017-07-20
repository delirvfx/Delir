export interface RenderingStatus {
    time: number
    frame: number
    durationFrame: number
    samplingRate: number
}

export interface IRenderingStreamObserver {
    onStateChanged?: (status: RenderingStatus) => void
    onFrame?: (canvas: HTMLCanvasElement, status: RenderingStatus) => void
    onAudioBuffered?: (buffers: Float32Array[], status: RenderingStatus) => void
}
