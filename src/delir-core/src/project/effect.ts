import * as _ from 'lodash'

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
    static deserialize(layerJson: EffectScheme)
    {
        const layer = new Effect
        const options = _.pick(layerJson.options, [
            'processor',
            'keyframeInterpolationMethod',
        ]) as EffectOptionScheme

        const keyframes = _.mapValues(layerJson.keyframes, keyframeSet => {
            return new Set(Array.from(keyframeSet).map(keyframe => Keyframe.deserialize(keyframe)))
        })

        Object.defineProperty(layer, 'id', {value: layerJson.id})
        Object.assign(layer.options, options)
        layer.keyframes = keyframes
        return layer
    }

    id: string|null = null

    private options: EffectOptionScheme = {
        name: null,
        processor: null,
        keyframeInterpolationMethod: 'linear',
    }

    keyframes: {[keyName:string]: Set<Keyframe>} = {}

    // get id(): string { return this._id }

    get processor(): string { return this.options.processor as string }
    set processor(processor: string) { this.options.processor = processor }

    get keyframeInterpolationMethod(): string { throw new Error('Effect.keyframeInterpolationMethod not implemented') }
    set keyframeInterpolationMethod(keyframeInterpolationMethod: string) { throw new Error('Effect.keyframeInterpolationMethod not implemented') }

    constructor()
    {
        Object.seal(this)
    }

    toPreBSON(): Object
    {
        return this.toJSON()
    }

    toJSON(): Object
    {
        return {
            id: this.id,
            options: Object.assign({}, this.options),
            keyframes: _.mapValues(this.keyframes, (keyframe, propName) => {
                return Array.from(keyframe).map(keyframe => keyframe.toPreBSON())
            }),
        }
    }
}
