import * as _ from 'lodash'
import * as uuid from 'uuid'

import {EffectScheme, EffectOptionScheme} from './scheme/effect'
import {KeyframeScheme} from './scheme/keyframe'
import Keyframe from './keyframe'
import Expression from '../values/expression'

export default class Effect
{
    public static deserialize(effectJson: EffectScheme)
    {
        const effect = new Effect()

        const config = _.pick(effectJson.config, [
            'processor',
            'keyframeInterpolationMethod',
        ]) as EffectOptionScheme

        const keyframes = _.mapValues(effectJson.keyframes, keyframeSet => {
            return Array.from(keyframeSet).map(keyframe => Keyframe.deserialize(keyframe))
        })

        const expressions = _.mapValues(effectJson.expressions, expr => {
            return new Expression(expr.language, expr.code)
        })

        Object.defineProperty(effect, '_id', {value: effectJson.id || uuid.v4()})
        Object.assign(effect._config, config)
        effect.keyframes = keyframes
        effect.expressions = expressions

        return effect
    }

    private _id: string = uuid.v4()

    private _config: EffectOptionScheme = {
        processor: null,
        keyframeInterpolationMethod: 'linear',
    }

    public keyframes: {[keyName: string]: Keyframe[]} = {}

    public expressions: {[keyName: string]: Expression} = {}

    get id(): string { return this._id }

    get processor(): string { return this._config.processor as string }
    set processor(processor: string) { this._config.processor = processor }

    get keyframeInterpolationMethod(): string { throw new Error('Effect.keyframeInterpolationMethod not implemented') }
    set keyframeInterpolationMethod(keyframeInterpolationMethod: string) { throw new Error('Effect.keyframeInterpolationMethod not implemented') }

    constructor()
    {
        Object.seal(this)
    }

    public toPreBSON(): EffectOptionScheme
    {
        return {
            id: this.id,
            config: Object.assign({}, this._config),
            keyframes: _.mapValues(this.keyframes, (keyframeSeq, propName) => {
                return keyframeSeq.map(keyframe => keyframe.toPreBSON())
            }),
            expressions: _.mapValues(this.expressions, expr => expr.toJSON())
        }
    }

    public toJSON(): EffectOptionScheme
    {
        return {
            id: this.id,
            config: Object.assign({}, this._config),
            keyframes: _.mapValues(this.keyframes, (keyframeSeq, propName) => {
                return keyframeSeq.map(keyframe => keyframe.toJSON())
            }),
            expressions: _.mapValues(this.expressions, expr => expr.toJSON())
        }
    }
}
