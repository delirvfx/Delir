import * as _ from 'lodash'
import * as uuid from 'uuid'
import toJSON from '../helper/toJSON'

// import Point2D from '../Values/point-2d'
// import Point3D from '../Values/point-3d'
// import Size2D from '../Values/size-2d'
// import Size3D from '../Values/size-3d'
import ColorRGB from '../Values/ColorRGB'
import ColorRGBA from '../Values/ColorRGBA'
import Expression from '../Values/Expression'

import { AssetPointerScheme, JSONKeyframeValueTypes, KeyframeConfigScheme, KeyframeScheme } from './scheme/keyframe'

export type KeyframeValueTypes = number | boolean | string | ColorRGB | ColorRGBA | Expression | AssetPointerScheme | null

export default class Keyframe<T extends KeyframeValueTypes = KeyframeValueTypes>
{
    public static deserialize(keyframeJson: KeyframeScheme)
    {
        const keyframe = new Keyframe()

        const config = _.pick(keyframeJson.config, [
            'value',
            'frameOnClip',
            'easeInParam',
            'easeOutParam',
        ]) as KeyframeConfigScheme

        const jsonValue: JSONKeyframeValueTypes = config.value
        let realValue: KeyframeValueTypes

        if (jsonValue == null || typeof jsonValue === 'number' || typeof jsonValue === 'string' || typeof jsonValue === 'boolean') {
            realValue = jsonValue
        } else if (_.isObject(jsonValue)) {
            if (jsonValue.type === 'color-rgb') {
                realValue = ColorRGB.fromJSON(jsonValue.value)
            } else if (jsonValue.type === 'color-rgba') {
                realValue = ColorRGBA.fromJSON(jsonValue.value)
            } else if (jsonValue.type === 'asset') {
                realValue = jsonValue.value
            } else if (jsonValue.type === 'expression') {
                realValue = Expression.fromJSON(jsonValue.value)
            } else {
                const __NEVER__: never = jsonValue
                throw new Error(`Deserialization failed, unexpected object value on Keyframe#${keyframeJson.id}`)
            }
        } else {
            throw new Error(`Deserialization failed, unexpected value type on Keyframe#${keyframeJson.id}`)
        }

        Object.defineProperty(keyframe, '_id', {value: keyframeJson.id || uuid.v4()})
        Object.assign(keyframe._config, config, { value: realValue })

        return keyframe
    }

    private _id: string = uuid.v4()

    private _config: {
        value: T | null,
        frameOnClip: number | null,
        easeInParam: [number, number],
        easeOutParam: [number, number],
    } = {
        value: null,
        frameOnClip: null,
        easeInParam: [1, 1],
        easeOutParam: [0, 0],
    }

    get id(): string { return this._id = this._id || uuid.v4() }

    get value(): T | null { return this._config.value }
    set value(value: T | null) { this._config.value = value }

    get frameOnClip(): number { return this._config.frameOnClip as number }
    set frameOnClip(frameOnClip: number) { this._config.frameOnClip = frameOnClip }

    /**
     * Easing param for transition to this keyframe
     * @property easeInParam
     */
    get easeInParam(): [number, number] { return this._config.easeInParam }
    set easeInParam(easeInParam: [number, number]) { this._config.easeInParam = easeInParam }

    /**
     * Easing param for transition to next keyframe from this keyframe
     * @property easeOutParam
     */
    get easeOutParam(): [number, number] { return this._config.easeOutParam }
    set easeOutParam(easeOutParam: [number, number]) { this._config.easeOutParam = easeOutParam }

    constructor()
    {
        Object.seal(this)
        Object.seal(this._config)
    }

    public toPreBSON(): KeyframeScheme
    {
        return this.toJSON()
    }

    public toJSON(): KeyframeScheme
    {
        let value: JSONKeyframeValueTypes

        if (this.value instanceof ColorRGB) {
            value = { type: 'color-rgb', value: this.value.toJSON() }
        } else if (this.value instanceof ColorRGBA) {
            value = { type: 'color-rgba', value: this.value.toJSON() }
        } else if (_.isObject(this.value) && _.has(this.value as AssetPointerScheme, 'assetId')) {
            value = { type: 'asset', value: toJSON(this.value as AssetPointerScheme) }
        } else if (_.isObject(this.value) && this.value instanceof Expression) {
            value = { type: 'expression', value: this.value.toJSON() }
        } else if (_.isObject(this.value)) {
            throw new Error(`Serialization failed, unexpected value type on Keyframe#${this.id}`)
        } else {
            value = this.value as string | number | boolean
        }

        return {
            id: this.id,
            config: {
                value,
                easeInParam: toJSON(this.easeInParam),
                easeOutParam: toJSON(this.easeOutParam),
                frameOnClip: this.frameOnClip,
            },
        }
    }
}
