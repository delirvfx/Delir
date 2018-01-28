export interface Keyframe {
    id: string
    type: string
    frameOnClip: number
    /** When this value is null, use linear interpolation */
    easeInParam: [number, number] | null
    /** When this value is null, use linear interpolation */
    easeOutParam: [number, number] | null
    value: any
}
