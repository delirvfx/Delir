import {KeyframeScheme} from './keyframe'
import Expression from '../../values/expression'

export interface EffectOptionScheme {
    name: string|null
    processor: string|null
    keyframeInterpolationMethod: string
}


export interface EffectScheme {
    id: string|null
    config: EffectOptionScheme
    keyframes: {[keyName: string]: KeyframeScheme[]}
    expressions: {[keyName: string]: Expression}
}
