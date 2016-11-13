// @flow
import _ from 'lodash'

export default class Keyframe
{
    static deserialize(keyframeJson: Object)
    {
        const keyframe = new Keyframe()
        const config = _.pick(keyframeJson.config, [
            'value',
            'frameOnLayer',
            'easeInParam',
            'easeOutParam',
        ])

        Object.defineProperty(keyframe, 'id', {value: keyframeJson.id})
        keyframe.config = config

        return keyframe
    }

    id: ?string = null

    config: {
        // propName: string,
        value: any,
        frameOnLayer: ?number,
        easeInParam: [number, number],
        easeOutParam: [number, number],
    } = {
        value: null,
        frameOnLayer: null,
        easeInParam: [1, 0],
        easeOutParam: [0, 1],
    }

    // get id(): string { return this._id }

    // get propName(): string { return this.config.propName }
    // set propName(propName: string) { this.config.propName = propName }

    get value(): any { return this.config.value }
    set value(value: any) { this.config.value = value }

    get frameOnLayer(): number { return this.config.frameOnLayer }
    set frameOnLayer(frameOnLayer: number) { this.config.frameOnLayer = frameOnLayer }

    get easeInParam(): Array<number> { return this.config.easeInParam }
    set easeInParam(easeInParam: Array<number>) { this.config.easeInParam = easeInParam }

    get easeOutParam(): Array<number> { return this.config.easeOutParam }
    set easeOutParam(easeOutParam: Array<number>) { this.config.easeOutParam = easeOutParam }

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
            config: Object.assign({}, this.config),
        }
    }
}
