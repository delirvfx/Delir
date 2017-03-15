import {KeyframeScheme} from './keyframe'

export interface ClipConfigScheme  {
    renderer: string|null
    rendererOptions: Object|null
    placedFrame: number|null
    durationFrames: number|null
    keyframeInterpolationMethod: string
}

export interface PropKeyframeList {
    [frame: number]: KeyframeScheme
}

export interface ClipScheme {
    id: string|null
    config: ClipConfigScheme
    keyframes: {[propName:string]: PropKeyframeList}
}
