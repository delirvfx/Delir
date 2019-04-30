import { Keyframe, KeyframeValueTypes } from '../Entity'
import { AnyParameterTypeDescriptor, TypeDescriptor } from '../PluginSupport/type-descriptor'
interface KeyFrameLink<T extends KeyframeValueTypes> {
    previous: Keyframe<T> | null
    active: Keyframe<T>
    next: Keyframe<T> | null
}
export interface KeyframeParamValueSequence {
    [frame: number]: KeyframeValueTypes
}
export declare function calcKeyframeValuesAt(
    frame: number,
    clipPlacedFrame: number,
    descriptor: TypeDescriptor,
    keyframes: {
        [paramName: string]: ReadonlyArray<Keyframe>
    },
): {
    [paramName: string]: KeyframeValueTypes
}
export declare function calcKeyframeValueAt(
    frame: number,
    clipPlacedFrame: number,
    desc: AnyParameterTypeDescriptor,
    keyframes: ReadonlyArray<Keyframe>,
): KeyframeValueTypes
export declare function calcKeyFrames(
    paramTypes: TypeDescriptor | AnyParameterTypeDescriptor[],
    keyFrames: {
        [paramName: string]: ReadonlyArray<Keyframe>
    },
    clipPlacedFrame: number,
    beginFrame: number,
    calcFrames: number,
): {
    [paramName: string]: KeyframeParamValueSequence
}
export declare function calcKeyframe(
    propDesc: AnyParameterTypeDescriptor,
    keyFrameSequense: ReadonlyArray<Keyframe>,
    clipPlacedFrame: number,
    beginFrame: number,
    calcFrames: number,
    transformer: (rate: number, frame: number, keyFrameLink: KeyFrameLink<KeyframeValueTypes>) => any,
): KeyframeParamValueSequence
export {}
