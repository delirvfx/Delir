import * as _ from 'lodash'
import Keyframe from './keyframe'
import Effect from './effect'
import {LayerScheme, LayerConfigScheme} from './scheme/layer'

export default class Layer
{
    static deserialize(layerJson: LayerScheme)
    {
        const layer = new Layer
        const config = _.pick(layerJson.config, [
            'renderer',
            'rendererOptions',
            'placedFrame',
            'durationFrames',
            'keyframeInterpolationMethod',
        ]) as LayerConfigScheme

        const keyframes = _.mapValues(layerJson.keyframes, keyframeSet => {
            return new Set(Array.from(keyframeSet).map(keyframe => Keyframe.deserialize(keyframe)))
        })

        Object.defineProperty(layer, 'id', {value: layerJson.id})
        Object.assign(layer.config, config)
        layer.keyframes = keyframes
        return layer
    }

    id: string|null = null

    config: {
        renderer: string|null,
        rendererOptions: Object|null,
        placedFrame: number|null,
        durationFrames: number|null,
        keyframeInterpolationMethod: string,
    } = {
        renderer: null,
        rendererOptions: {},
        placedFrame: null,
        durationFrames: null,
        keyframeInterpolationMethod: 'linear',
    }

    keyframes: {[keyName:string]: Set<Keyframe>} = {}
    effects: Effect[] = []

    // get id(): string { return this._id }

    get renderer(): string { return this.config.renderer as string }
    set renderer(renderer: string) { this.config.renderer = renderer }

    get rendererOptions(): Object { return this.config.rendererOptions as Object }
    set rendererOptions(rendererOptions: Object) { this.config.rendererOptions = rendererOptions }

    get placedFrame(): number { return this.config.placedFrame as number }
    set placedFrame(placedFrame: number) { this.config.placedFrame = placedFrame }

    get durationFrame(): number { throw new Error('layer.durationFrame is discontinuance.') }
    set durationFrame(durationFrames: number) { throw new Error('layer.durationFrame is discontinuance.') }

    get durationFrames(): number { return this.config.durationFrames as number }
    set durationFrames(durationFrames: number) { this.config.durationFrames = durationFrames }

    get keyframeInterpolationMethod(): string { return this.config.keyframeInterpolationMethod as string }
    set keyframeInterpolationMethod(keyframeInterpolationMethod: string) { this.config.keyframeInterpolationMethod = keyframeInterpolationMethod }

    constructor()
    {
        Object.seal(this)
    }

    toPreBSON(): Object
    {
        return {
            id: this.id,
            config: Object.assign({}, this.config),
            effects: this.effects.slice(0),
            keyframes: _.mapValues(this.keyframes, (keyframe, propName) => {
                return Array.from(keyframe).map(keyframe => keyframe.toPreBSON())
            }),
        }
    }

    toJSON(): Object
    {
        return {
            id: this.id,
            config: Object.assign({}, this.config),
            effects: this.effects.slice(0),
            keyframes: _.mapValues(this.keyframes, (keyframe, propName) => {
                return Array.from(keyframe).map(keyframe => keyframe.toJSON())
            }),
        }
    }
}
