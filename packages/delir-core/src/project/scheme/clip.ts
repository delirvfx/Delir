import { ExpressionJSON } from '../../Values/expression'
import { EffectScheme } from './effect'
import { KeyframeScheme } from './keyframe'

export interface ClipConfigScheme {
    renderer: string | null
    placedFrame: number | null
    durationFrames: number | null
    keyframeInterpolationMethod: string
}

export interface ClipScheme {
    id: string | null
    config: ClipConfigScheme
    effects: EffectScheme[]
    keyframes: {[keyName: string]: KeyframeScheme[]}
    expressions: {[keyName: string]: ExpressionJSON}
}
