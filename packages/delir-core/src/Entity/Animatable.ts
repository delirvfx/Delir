import { Expression } from '../Values'
import { Keyframe } from './Keyframe'

export class Animatable {
    public keyframes: { [paramName: string]: ReadonlyArray<Keyframe> } = Object.create(null)
    public expressions: { [paramName: string]: Expression } = Object.create(null)

    public findKeyframe(keyframeId: Keyframe.Id): Keyframe | null {
        for (const paramName of Object.keys(this.keyframes)) {
            const keyframe = this.keyframes[paramName].find(keyframe => keyframe.id === keyframeId)
            if (keyframe) return keyframe
        }

        return null
    }

    public findKeyframeAtFrame(paramName: string, frame: number): Keyframe | null {
        const sequence = this.keyframes[paramName]
        if (!sequence) return null

        for (const kf of sequence) {
            if (kf.frameOnClip === frame) {
                return kf
            }
        }

        return null
    }

    public findActiveKeyframeAt(paramName: string, frame: number): Keyframe | null {
        const sequence = this.keyframes[paramName]
        if (!sequence) return null

        for (let idx = 0, l = sequence.length; idx < l; idx++) {
            const pkf = sequence[idx - 1]
            const ckf = sequence[idx]
            const nkf = sequence[idx + 1]

            if (ckf.frameOnClip === frame) {
                return ckf
            }

            // [0]  10  20
            //       ◇   ◇
            // -> use 10frame's value at frame 0
            if (!pkf && frame <= ckf.frameOnClip) {
                return ckf
            }

            //  0  [10]
            //  ◇   |
            // -> use 0frame's value at frame 10
            if (!nkf && frame >= ckf.frameOnClip) {
                return ckf
            }
        }

        return null
    }

    public addKeyframe(paramName: string, keyframe: Keyframe): void {
        const newSequence = [
            ...(this.keyframes[paramName] || []),
            keyframe
        ].sort((a, b) => a.frameOnClip - b.frameOnClip)

        this.keyframes[paramName] = newSequence
    }

    public removeKeyframe(paramName: string, keyframeId: Keyframe.Id): boolean {
        const sequence = this.keyframes[paramName]
        if (!sequence) return false

        const beforeLength = sequence.length
        this.keyframes[paramName] = sequence.filter(keyframe => keyframe.id !== keyframeId)
        return this.keyframes[paramName].length !== beforeLength
    }

    public findExpression(paramName: string): Expression | null {
        return this.expressions[paramName] || null
    }

    public setExpression(paramName: string, expression: Expression | null) {
        if (expression == null) {
            delete this.expressions[paramName]
            return
        }

        this.expressions[paramName] = expression
    }
}
