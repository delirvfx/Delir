import {KeyframeScheme} from './keyframe'
import {ExpressionJSON} from '../../values/expression'

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
    expressions: {[keyName: string]: ExpressionJSON}
}
