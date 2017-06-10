import {KeyframeScheme} from './keyframe'

export interface EffectOptionScheme {
    name: string|null
    processor: string|null
    keyframeInterpolationMethod: string
}


export interface EffectScheme {
    id: string|null
    config: EffectOptionScheme
    keyframes: {[keyName: string]: KeyframeScheme[]}
}
