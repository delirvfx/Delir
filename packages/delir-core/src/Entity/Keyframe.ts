import * as uuid from 'uuid'

import AssetPointer from '../Values/AssetPointer'
import ColorRGB from '../Values/color-rgb'
import ColorRGBA from '../Values/color-rgba'
import Expression from '../Values/Expression'

export type KeyframeValueTypes = number | boolean | string | ColorRGB | ColorRGBA | Expression | AssetPointer | null

export default class Keyframe<T extends KeyframeValueTypes = KeyframeValueTypes> {
    public id: string
    public value: T
    public frameOnClip: number
    public easeInParam: [number, number]
    public easeOutParam: [number, number]

    constructor() {
        this.id = uuid.v4()
    }
}
