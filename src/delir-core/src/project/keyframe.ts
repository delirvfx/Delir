// @flow
import * as _ from 'lodash'
import * as uuid from 'uuid'
import {KeyframeValueTypes, KeyframeScheme, KeyframeConfigScheme} from './scheme/keyframe'

export default class Keyframe
{
    static deserialize(keyframeJson: KeyframeScheme)
    {
        const keyframe = new Keyframe()
        const config = _.pick(keyframeJson.config, [
            'value',
            'frameOnClip',
            'easeInParam',
            'easeOutParam',
        ]) as KeyframeConfigScheme

        Object.defineProperty(keyframe, '_id', {value: keyframeJson.id})
        keyframe.config = config

        return keyframe
    }

    private _id: string|null =  null

    config: {
        value: KeyframeValueTypes|null,
        frameOnClip: number|null,
        easeInParam: [number, number],
        easeOutParam: [number, number],
    } = {
        value: null,
        frameOnClip: null,
        easeInParam: [1, 1],
        easeOutParam: [0, 0],
    }

    get id(): string { return this._id = this._id || uuid.v4() }

    get value(): KeyframeValueTypes|null { return this.config.value }
    set value(value: KeyframeValueTypes|null) { this.config.value = value }

    get frameOnClip(): number { return this.config.frameOnClip as number }
    set frameOnClip(frameOnClip: number) { this.config.frameOnClip = frameOnClip }

    /**
     * Easing param for transition to this keyframe
     * @property easeInParam
     */
    get easeInParam(): [number, number] { return this.config.easeInParam }
    set easeInParam(easeInParam: [number, number]) { this.config.easeInParam = easeInParam }

    /**
     * Easing param for transition to next keyframe from this keyframe
     * @property easeOutParam
     */
    get easeOutParam(): [number, number] { return this.config.easeOutParam }
    set easeOutParam(easeOutParam: [number, number]) { this.config.easeOutParam = easeOutParam }

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
