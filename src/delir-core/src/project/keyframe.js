// @flow
import _ from 'lodash'

export default class KeyFrame
{
    static deserialize(keyframeJson: Object)
    {
        const keyframe = new KeyFrame()
        const config = _.pick(keyframeJson.config, [
            'key',
            'value',
            'frameOnLayer',
            'easeInParam',
            'easeOutParam',
        ])

        keyframe._id = keyframeJson.id
        keyframe.config = config

        return keyframe
    }

    _id: string

    config: {
        key: string,
        value: any,
        frameOnLayer: number,
        easeInParam: Array<number>,
        easeOutParam: Array<number>,
    }

    get id(): string { return this._id }

    get key(): string { return this.config.key }
    set key(key: string) { this.config.key = key }

    get value(): any { return this.config.value }
    set value(value: any) { this.config.value = value }

    get frameOnLayer(): number { return this.config.frameOnLayer }
    set frameOnLayer(frameOnLayer: number) { this.config.frameOnLayer = frameOnLayer }

    get easeInParam(): Array<number> { return this.config.easeInParam }
    set easeInParam(easeInParam: Array<number>) { this.config.easeInParam = easeInParam }

    get easeOutParam(): Array<number> { return this.config.easeOutParam }
    set easeOutParam(easeOutParam: Array<number>) { this.config.easeOutParam = easeOutParam }

    toPreBSON(): Object
    {
        return this.toJSON()
    }

    toJSON(): Object
    {
        return {
            id: this.id,
            config: Object.assign({}, this.config),
        }
    }
}
