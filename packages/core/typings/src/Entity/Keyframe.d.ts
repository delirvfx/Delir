import { Branded } from '../helper/Branded'
import AssetPointer from '../Values/AssetPointer'
import ColorRGB from '../Values/ColorRGB'
import ColorRGBA from '../Values/ColorRGBA'
import Expression from '../Values/Expression'
export declare type KeyframeValueTypes =
    | number
    | boolean
    | string
    | ColorRGB
    | ColorRGBA
    | Expression
    | AssetPointer
    | null
interface KeyframeProps {
    id?: string
    value: KeyframeValueTypes
    frameOnClip: number
    easeInParam?: [number, number]
    easeOutParam?: [number, number]
}
declare type KeyframeId = Branded<string, 'Entity/Keyframe/Id'>
declare class Keyframe<T extends KeyframeValueTypes = KeyframeValueTypes> implements KeyframeProps {
    public id: Keyframe.Id
    public value: T
    public frameOnClip: number
    /**
     * right top is [1, 1] ([x, y])
     *     ◇ < previous keyframe to this keyframe
     * ◇───┘ < ease-in
     */
    public easeInParam: [number, number]
    /**
     * left bottom is [0, 0] ([x, y])
     *     ◇ < next keyframe
     * ◇───┘ < this keyframe to next keyframe, ease-out
     */
    public easeOutParam: [number, number]
    private normalize
    constructor(props: KeyframeProps)
    public patch(props: Partial<KeyframeProps>): void
}
declare namespace Keyframe {
    type Id = KeyframeId
}
export { Keyframe }
