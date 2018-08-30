import * as uuid from 'uuid'

import AssetPointer from '../values/AssetPointer'
import ColorRGB from '../values/color-rgb'
import ColorRGBA from '../values/color-rgba'
import Expression from '../values/expression'

export type KeyframeValueTypes = number | boolean | string | ColorRGB | ColorRGBA | Expression | AssetPointer | null

export default class Keyframe<T extends KeyframeValueTypes> {
    public id: string
    public value: T
    public frameOnClip: number
    public easeInParam: [number, number]
    public easeOutParam: [number, number]

    constructor() {
        this.id = uuid.v4()
    }
}
