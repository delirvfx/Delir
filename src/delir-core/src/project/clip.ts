import * as _ from 'lodash'
import * as uuid from 'uuid'

import { AvailableRenderer } from '../engine/renderer'
import Expression from '../values/expression'
import Effect from './effect'
import Keyframe from './keyframe'
import { ClipConfigScheme, ClipScheme } from './scheme/clip'

import toJSON from '../helper/toJSON'

export default class Clip
{

    get id(): string { return this._id }

    get renderer(): AvailableRenderer { return this._config.renderer }
    set renderer(renderer: AvailableRenderer) { this._config.renderer = renderer }

    get placedFrame(): number { return this._config.placedFrame as number }
    set placedFrame(placedFrame: number) { this._config.placedFrame = placedFrame }

    get durationFrame(): number { throw new Error('clip.durationFrame is discontinuance.') }
    set durationFrame(durationFrames: number) { throw new Error('clip.durationFrame is discontinuance.') }

    get durationFrames(): number { return this._config.durationFrames as number }
    set durationFrames(durationFrames: number) { this._config.durationFrames = durationFrames }

    get keyframeInterpolationMethod(): string { return this._config.keyframeInterpolationMethod as string }
    set keyframeInterpolationMethod(keyframeInterpolationMethod: string) { this._config.keyframeInterpolationMethod = keyframeInterpolationMethod }
    public static deserialize(clipJson: ClipScheme)
    {
        const clip = new Clip()

        const config = _.pick(clipJson.config, [
            'renderer',
            'placedFrame',
            'durationFrames',
            'keyframeInterpolationMethod',
            'expressions',
        ]) as ClipConfigScheme

        const keyframes = _.mapValues(clipJson.keyframes, keyframeSet => {
            return Array.from(keyframeSet).map(keyframe => Keyframe.deserialize(keyframe))
        })

        const expressions = _.mapValues(clipJson.expressions, expr => {
            return new Expression(expr.language, expr.code)
        })

        const effects = _.map(clipJson.effects, effect => {
            return Effect.deserialize(effect)
        })

        Object.defineProperty(clip, '_id', {value: clipJson.id || uuid.v4()})
        Object.assign(clip._config, config)
        clip.keyframes = keyframes
        clip.expressions = expressions
        clip.effects = effects

        return clip
    }

    public keyframes: {[propName: string]: Keyframe[]} = {}

    public expressions: {[keyName: string]: Expression} = {}

    public effects: Effect[] = []

    private _id: string = uuid.v4()

    private _config: {
        renderer: AvailableRenderer,
        placedFrame: number | null,
        durationFrames: number | null,
        keyframeInterpolationMethod: string,
    } = {
        renderer: null,
        placedFrame: null,
        durationFrames: null,
        keyframeInterpolationMethod: 'linear',
    }

    constructor()
    {
        Object.seal(this)
    }

    public toPreBSON(): ClipScheme
    {
        return {
            id: this._id,
            config: toJSON(this._config),
            effects: this.effects.map(effect => effect.toPreBSON()),
            keyframes: _.mapValues(this.keyframes, (keyframes, propName) => {
                return keyframes.map(keyframe => keyframe.toPreBSON())
            }) as any,
            expressions: toJSON(this.expressions)
        }
    }

    public toJSON(): ClipScheme
    {
        return {
            id: this._id,
            config: toJSON(this._config),
            effects: this.effects.map(effect => effect.toJSON()),
            keyframes: _.mapValues(this.keyframes, (keyframes, propName) => {
                return keyframes.map(keyframe => keyframe.toJSON())
            }) as any,
            expressions: toJSON(this.expressions)
        }
    }
}
