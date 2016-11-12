// @flow
import _ from 'lodash'
import Keyframe from './keyframe'

export default class Layer
{
    static deserialize(layerJson: Object)
    {
        const layer = new Layer
        const config = _.pick(layerJson.config, [
            'renderer',
            'rendererOptions',
            'placedFrame',
            'durationFrame',
            'keyframeInterpolationMethod',
        ])

        const keyframes = _.map(layerJson.keyframes, keyframes => {
            return new Set(keyframes.map(keyframe => Keyframe.deserialize(keyframe)))
        })

        Object.defineProperty(layer, 'id', {value: layerJson.id})
        Object.assign(layer.config, config)
        layer.keyframes = keyframes
        return layer
    }

    id: string

    config: {
        renderer: ?string,
        rendererOptions: ?Object,
        placedFrame: ?number,
        durationFrame: ?number,
        keyframeInterpolationMethod: string,
    } = {
        renderer: null,
        rendererOptions: {},
        placedFrame: null,
        durationFrame: null,
        keyframeInterpolationMethod: 'linear',
    }

    // TODO: assign ids to keyframes
    keyframes: {[keyName:string]: Set<Keyframe>} = {}

    // get id(): string { return this._id }

    get renderer(): string { return this.config.renderer }
    set renderer(renderer: string) { this.config.renderer = renderer }

    get rendererOptions(): Object { return this.config.rendererOptions }
    set rendererOptions(rendererOptions: Object) { this.config.rendererOptions = rendererOptions }

    get placedFrame(): number { return this.config.placedFrame }
    set placedFrame(placedFrame: number) { this.config.placedFrame = placedFrame }

    get durationFrame(): number { return this.config.durationFrame }
    set durationFrame(durationFrame: number) { this.config.durationFrame = durationFrame }

    get keyframeInterpolationMethod(): string { return this.config.keyframeInterpolationMethod }
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
            keyframes: _.map(this.keyframes, keyframe => keyframe.toPreBSON()),
        }
    }

    toJSON(): Object
    {
        return {
            id: this.id,
            config: Object.assign({}, this.config),
            keyframes: _.map(this.keyframes, keyframe => keyframe.toPreBSON()),
        }
    }
}
