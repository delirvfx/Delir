import { Expression } from '../Values'
import { Keyframe } from './Keyframe'
export declare class Animatable {
    public keyframes: {
        [paramName: string]: ReadonlyArray<Keyframe>
    }
    public expressions: {
        [paramName: string]: Expression
    }
    public findKeyframe(keyframeId: string): Keyframe | null
    public findKeyframeAtFrame(paramName: string, frame: number): Keyframe | null
    public findActiveKeyframeAt(paramName: string, frame: number): Keyframe | null
    public addKeyframe(paramName: string, keyframe: Keyframe): void
    public removeKeyframe(paramName: string, keyframeId: string): boolean
    public findExpression(paramName: string): Expression | null
    public setExpression(paramName: string, expression: Expression | null): void
}
