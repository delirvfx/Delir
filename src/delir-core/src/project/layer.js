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
            'durationFrames',
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

    id: ?string = null

    config: {
        renderer: ?string,
        rendererOptions: ?Object,
        placedFrame: ?number,
        durationFrames: ?number,
        keyframeInterpolationMethod: string,
    } = {
        renderer: null,
        rendererOptions: {},
        placedFrame: null,
        durationFrames: null,
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

    get durationFrame(): number { throw new Error('layer.durationFrame is discontinuance.') }
    set durationFrame(durationFrames: number) { throw new Error('layer.durationFrame is discontinuance.') }

    get durationFrames(): number { return this.config.durationFrames }
    set durationFrames(durationFrames: number) { this.config.durationFrames = durationFrames }

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
