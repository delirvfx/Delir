import {KeyframeScheme} from './keyframe'

export interface ClipConfigScheme {
    renderer: string|null
    placedFrame: number|null
    durationFrames: number|null
    keyframeInterpolationMethod: string
}

export interface ClipScheme {
    id: string|null
    config: ClipConfigScheme
    effects: any[]
    keyframes: {[keyName:string]: KeyframeScheme[]}
}
