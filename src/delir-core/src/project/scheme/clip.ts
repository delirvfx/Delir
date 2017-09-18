import {KeyframeScheme} from './keyframe'
import {EffectScheme} from './effect'
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
    effects: EffectScheme[]
    keyframes: {[keyName: string]: KeyframeScheme[]}
    expressions: {[keyName: string]: ExpressionJSON}
}
