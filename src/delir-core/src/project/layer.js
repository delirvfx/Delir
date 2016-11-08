// @flow
import _ from 'lodash'
import KeyFrame from './keyframe'

import Time from './time'

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
        ])
        const keyframes = layerJson.keyframes.map(keyframe => KeyFrame.deserialize(keyframe))

        layer._id = layerJson.id
        Object.assign(layer.config, config)
        layer.keyframes = new Set(keyframes)
        return layer
    }

    _id: string

    config: {
        renderer: ?string,
        rendererOptions: ?Object,
        placedFrame: ?number,
        durationFrame: ?number
    } = {
        renderer: null,
        rendererOptions: {},
        placedFrame: null,
        durationFrame: null,
    }

    // TODO: assign ids to keyframes
    keyframes: {[keyName:string]: Array<KeyFrame>} = {}

    get id(): string { return this._id }

    get renderer(): string { return this.config.renderer }
    set renderer(renderer: string) { this.config.renderer = renderer }

    get rendererOptions(): Object { return this.config.rendererOptions }
    set rendererOptions(rendererOptions: Object) { this.config.rendererOptions = rendererOptions }

    get placedFrame(): number { return this.config.placedFrame }
    set placedFrame(placedFrame: number) { this.config.placedFrame = placedFrame }

    get durationFrame(): number { return this.config.durationFrame }
    set durationFrame(durationFrame: number) { this.config.durationFrame = durationFrame }

    toPreBSON(): Object
    {
        return {
            id: this.id,
            config: Object.assign({}, this.config),
            keyframes: Array.from(this.keyframes.values()).map(keyframe => keyframe.toPreBSON()),
        }
    }

    toJSON(): Object
    {
        return {
            id: this.id,
            config: Object.assign({}, this.config),
            keyframes: Array.from(this.keyframes.values()).map(keyframe => keyframe.toJSON()),
        }
    }
}
