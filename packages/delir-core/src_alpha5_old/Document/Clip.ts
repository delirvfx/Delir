import { Expression } from './Expression'
import { Keyframe } from './Keyframe'

export interface Clip {
    id: string
    renderer: string
    placedFrame: number
    durationFrames: number
    keyframes: { [prop: string]: Keyframe }
    expressions: { [prop: string]: Expression }
    /** ID of Effects */
    effects: string[]
}
