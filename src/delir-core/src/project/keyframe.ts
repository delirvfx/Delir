// @flow
import * as _ from 'lodash'
import {KeyframeScheme, KeyframeConfigScheme} from './scheme/keyframe'

export default class Keyframe
{
    static deserialize(keyframeJson: KeyframeScheme)
    {
        const keyframe = new Keyframe()
        const config = _.pick(keyframeJson.config, [
            'value',
            'easeInParam',
            'easeOutParam',
        ]) as KeyframeConfigScheme

        Object.defineProperty(keyframe, 'id', {value: keyframeJson.id})
        keyframe.config = config

        return keyframe
    }

    id: string|null = null

    config: {
        // propName: string,
        value: any,
        easeInParam: [number, number],
        easeOutParam: [number, number],
    } = {
        value: null,
        easeInParam: [1, 0],
        easeOutParam: [0, 1],
    }

    // get id(): string { return this._id }

    // get propName(): string { return this.config.propName }
    // set propName(propName: string) { this.config.propName = propName }

    get value(): any { return this.config.value }
    set value(value: any) { this.config.value = value }

    get easeInParam(): [number, number] { return this.config.easeInParam }
    set easeInParam(easeInParam: [number, number]) { this.config.easeInParam = easeInParam }

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
