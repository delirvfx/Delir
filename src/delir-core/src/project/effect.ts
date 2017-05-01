import * as _ from 'lodash'
import * as uuid from 'uuid'

import {KeyframeScheme} from './scheme/keyframe'
import Keyframe from './keyframe'

export interface EffectOptionScheme {
    name: string|null
    processor: string|null
    keyframeInterpolationMethod: string
}

export interface EffectScheme {
    id: string|null
    options: EffectOptionScheme
    keyframes: {[keyName:string]: KeyframeScheme[]}
}

export default class Effect
{
    public static deserialize(effectJson: EffectScheme)
    {
        const effect = new Effect()

        const options = _.pick(effectJson.options, [
            'processor',
            'keyframeInterpolationMethod',
        ]) as EffectOptionScheme

        const keyframes = _.mapValues(effectJson.keyframes, keyframeSet => {
            return new Set(Array.from(keyframeSet).map(keyframe => Keyframe.deserialize(keyframe)))
        })

        Object.defineProperty(effect, '_id', {value: effectJson.id})
        Object.assign(effect._options, options)
        effect.keyframes = keyframes

        return effect
    }

    private _id: string = uuid.v4()

    private _options: EffectOptionScheme = {
        name: null,
        processor: null,
        keyframeInterpolationMethod: 'linear',
    }

    public keyframes: {[keyName:string]: Set<Keyframe>} = {}

    get id(): string { return this._id }

    get processor(): string { return this._options.processor as string }
    set processor(processor: string) { this._options.processor = processor }

    get keyframeInterpolationMethod(): string { throw new Error('Effect.keyframeInterpolationMethod not implemented') }
    set keyframeInterpolationMethod(keyframeInterpolationMethod: string) { throw new Error('Effect.keyframeInterpolationMethod not implemented') }

    constructor()
    {
        Object.seal(this)
    }

    public toPreBSON(): Object
    {
        return {
            id: this.id,
            options: Object.assign({}, this._options),
            keyframes: _.mapValues(this.keyframes, (keyframe, propName) => {
                return keyframe.map(keyframe => keyframe.toPreBSON())
            }),
        }
    }

    public toJSON(): Object
    {
        return {
            id: this.id,
            options: Object.assign({}, this._options),
            keyframes: _.mapValues(this.keyframes, (keyframe, propName) => {
                return keyframe.map(keyframe => keyframe.toJSON())
            }),
        }
    }
}
