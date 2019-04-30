export declare const resampling: (
    sourceSamplingRate: number,
    destSamplingRate: number,
    inputs: Float32Array[],
) => Promise<Float32Array[]>
/**
 * Merge `incoming` audio buffer(Float32Array) into `dest` array.
 */
export declare const mergeInto: (
    dest: Float32Array[],
    incoming: Float32Array[],
    numberOfChannels: number,
    sampleRate: number,
) => Promise<void>
