import * as _ from 'lodash'
import * as uuid from 'uuid'

import Keyframe from './keyframe'
import Effect from './effect'
import {ClipScheme, ClipConfigScheme} from './scheme/clip'
import {AvailableRenderer} from '../renderer/renderer'

export default class Clip
{
    public static deserialize(clipJson: ClipScheme)
    {
        const clip = new Clip()

        const config = _.pick(clipJson.config, [
            'renderer',
            'placedFrame',
            'durationFrames',
            'keyframeInterpolationMethod',
        ]) as ClipConfigScheme

        const keyframes = _.mapValues(clipJson.keyframes, keyframeSet => {
            return Array.from(keyframeSet).map(keyframe => Keyframe.deserialize(keyframe))
        })

        Object.defineProperty(clip, '_id', {value: clipJson.id || uuid.v4()})
        Object.assign(clip._config, config)
        clip.keyframes = keyframes

        return clip
    }

    private _id: string = uuid.v4()

    private _config: {
        renderer: AvailableRenderer,
        placedFrame: number|null,
        durationFrames: number|null,
        keyframeInterpolationMethod: string,
    } = {
        renderer: null,
        placedFrame: null,
        durationFrames: null,
        keyframeInterpolationMethod: 'linear',
    }

    public keyframes: {[propName: string]: Keyframe[]} = {}

    public effects: Effect[] = []

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

    constructor()
    {
        Object.seal(this)
    }

    public toPreBSON(): ClipScheme
    {
        return {
            id: this._id,
            config: Object.assign({}, this._config),
            effects: this.effects.slice(0),
            keyframes: _.mapValues(this.keyframes, (keyframes, propName) => {
                return keyframes.map(keyframe => keyframe.toPreBSON())
            }) as any,
        }
    }

    public toJSON(): ClipScheme
    {
        return {
            id: this._id,
            config: Object.assign({}, this._config),
            effects: this.effects.slice(0),
            keyframes: _.mapValues(this.keyframes, (keyframes, propName) => {
                return keyframes.map(keyframe => keyframe.toJSON())
            }) as any,
        }
    }
}
