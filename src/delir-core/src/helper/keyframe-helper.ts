import Asset from '../project/asset'
import KeyFrame from '../project/keyframe'
import {PropKeyframeList} from '../project/scheme/clip'

import {
    TypeDescriptor,
    ParameterValueTypes,
    AnyParameterTypeDescriptor,
} from '../plugin/type-descriptor'

import bezierEasing from 'bezier-easing'

interface KeyFrameLink {
    previous?: KeyFrame,
    active: KeyFrame,
    next?: KeyFrame,
}

export interface KeyFrameSequence {
    [frame: number]: ParameterValueTypes
}

export function calcKeyframeValueAt(
    frame: number,
    desc: AnyParameterTypeDescriptor,
    keyframes: PropKeyframeList,
): ParameterValueTypes
{
    switch (desc.type) {
        case 'POINT_2D':
            return calcKeyframe(keyframes, frame, 1, calcPoint2dKeyFrames)[frame]
        case 'POINT_3D':
            return calcKeyframe(keyframes, frame, 1, calcPoint3dKeyFrames)[frame]
        case 'SIZE_2D':
            return calcKeyframe(keyframes, frame, 1, calcSize2dKeyFrames)[frame]
        case 'SIZE_3D':
            return calcKeyframe(keyframes, frame, 1, calcSize3dKeyFrames)[frame]
        case 'COLOR_RGB':
            return calcKeyframe(keyframes, frame, 1, calcColorRgbKeyFrames)[frame]
        case 'COLOR_RGBA':
            return calcKeyframe(keyframes, frame, 1, calcColorRgbaKeyFrames)[frame]
        case 'BOOL':
            return calcKeyframe(keyframes, frame, 1, calcBoolKeyFrames)[frame]
        case 'STRING':
            return calcKeyframe(keyframes, frame, 1, calcStringKeyFrames)[frame]
        case 'NUMBER':
            return calcKeyframe(keyframes, frame, 1, calcNumberKeyFrames)[frame]
        case 'FLOAT':
            return calcKeyframe(keyframes, frame, 1, calcFloatKeyFrames)[frame]
        case 'ENUM':
            return calcKeyframe(keyframes, frame, 1, calcEnumKeyFrames)[frame]
        case 'CLIP':
            return calcKeyframe(keyframes, frame, 1, calcNoAnimatable)[frame]
        case 'PULSE':
            return calcKeyframe(keyframes, frame, 1, calcPulseKeyFrames)[frame]
        case 'ARRAY':
            return calcKeyframe(keyframes, frame, 1, calcArrayOfKeyFrames)[frame]
        case 'ASSET':
            return calcKeyframe(keyframes, frame, 1, calcAssetKeyFrames)[frame]
        default:
            throw new Error(`Unsupported parameter type ${desc.type}`)
    }
}

export function calcKeyFrames(
    paramTypes: TypeDescriptor,
    keyFrames: {[propName: string]: PropKeyframeList},
    beginFrame: number,
    calcFrames: number
): {[propName: string]: KeyFrameSequence}
{
    const tables: {[propName: string]: KeyFrameSequence} = {}

    for (const propDesc of paramTypes.properties) {
        const {propName} = propDesc

        switch (propDesc.type) {
            case 'POINT_2D':
                tables[propName] = calcKeyframe(keyFrames[propName], beginFrame, calcFrames, calcPoint2dKeyFrames)
            break;
            case 'POINT_3D':
                tables[propName] = calcKeyframe(keyFrames[propName], beginFrame, calcFrames, calcPoint3dKeyFrames)
            break;
            case 'SIZE_2D':
                tables[propName] = calcKeyframe(keyFrames[propName], beginFrame, calcFrames, calcSize2dKeyFrames)
            break;
            case 'SIZE_3D':
                tables[propName] = calcKeyframe(keyFrames[propName], beginFrame, calcFrames, calcSize3dKeyFrames)
            break;
            case 'COLOR_RGB':
                tables[propName] = calcKeyframe(keyFrames[propName], beginFrame, calcFrames, calcColorRgbKeyFrames)
            break;
            case 'COLOR_RGBA':
                tables[propName] = calcKeyframe(keyFrames[propName], beginFrame, calcFrames, calcColorRgbaKeyFrames)
            break;
            case 'BOOL':
                tables[propName] = calcKeyframe(keyFrames[propName], beginFrame, calcFrames, calcBoolKeyFrames)
            break;
            case 'STRING':
                tables[propName] = calcKeyframe(keyFrames[propName], beginFrame, calcFrames, calcStringKeyFrames)
            break;
            case 'NUMBER':
                tables[propName] = calcKeyframe(keyFrames[propName], beginFrame, calcFrames, calcNumberKeyFrames)
            break;
            case 'FLOAT':
                tables[propName] = calcKeyframe(keyFrames[propName], beginFrame, calcFrames, calcFloatKeyFrames)
            break;
            case 'ENUM':
                tables[propName] = calcKeyframe(keyFrames[propName], beginFrame, calcFrames, calcEnumKeyFrames)
            break;
            case 'CLIP':
                tables[propName] = calcKeyframe(keyFrames[propName], beginFrame, calcFrames, calcNoAnimatable)
            break;
            case 'PULSE':
                tables[propName] = calcKeyframe(keyFrames[propName], beginFrame, calcFrames, calcPulseKeyFrames)
            break;
            case 'ARRAY':
                tables[propName] = calcKeyframe(keyFrames[propName], beginFrame, calcFrames, calcArrayOfKeyFrames)
            break;
            case 'ASSET':
                tables[propName] = calcKeyframe(keyFrames[propName], beginFrame, calcFrames, calcAssetKeyFrames)
            break;
        }
    }

    return tables
}

export function calcKeyframe(
    keyFrameSequense: PropKeyframeList,
    beginFrame: number,
    calcFrames: number,
    transformer: (rate: number, frame: number, keyFrameLink: KeyFrameLink) => any
): KeyFrameSequence
{
    const orderedSequense: PropKeyframeList = keyFrameSequense.slice(0).sort((kfA, kfB) => kfA.frameOnClip - kfB.frameOnClip)
    const linkedSequense: Array<KeyFrameLink> = _buildLinkedKeyFrame(orderedSequense)

    const table: KeyFrameSequence = {}

    for (let frame = beginFrame, end = beginFrame + calcFrames; frame <= end; frame++) {
        let activeKeyFrame: KeyFrameLink|null = _activeKeyFrameOfFrame(linkedSequense, frame)

        if (activeKeyFrame == null) {
            // TODO: default value
            table[frame] = null
            continue
        }

        if (activeKeyFrame.previous == null && frame < activeKeyFrame.active.frameOnClip) {
            table[frame] = activeKeyFrame.active.value
            continue
        }

        if (activeKeyFrame.next == null && frame >= activeKeyFrame.active.frameOnClip) {
            table[frame] = activeKeyFrame.active.value
            continue
        }

        const currentKeyEaseOut = activeKeyFrame.active.easeOutParam ? activeKeyFrame.active.easeOutParam : [0, 1]
        const nextKeyEaseIn = activeKeyFrame.next!.easeInParam ? activeKeyFrame.next!.easeInParam : [1, 0]
        // TODO: Cache Bezier instance between change active keyframe
        const bezier = bezierEasing(...currentKeyEaseOut, ...nextKeyEaseIn)

        const progressRate = (frame - activeKeyFrame.active.frameOnClip) / (activeKeyFrame.next!.frameOnClip - activeKeyFrame.active.frameOnClip)
        table[frame] = transformer(bezier(progressRate), frame, activeKeyFrame)
    }

    return table
}

function _buildLinkedKeyFrame(orderedKeyFrameSeq: PropKeyframeList): Array<KeyFrameLink>
{
    const linked = []
    let idx = 0
    for (const keyFrame of orderedKeyFrameSeq) {
        keyFrame; // for typescript
        linked.push({
            previous: orderedKeyFrameSeq[idx - 1],
            active: orderedKeyFrameSeq[idx],
            next: orderedKeyFrameSeq[idx + 1],
        })
        idx++
    }
    return linked
}

function _activeKeyFrameOfFrame(linkedKeyFrameSeq: Array<KeyFrameLink>, frame: number): KeyFrameLink|null
{
    if (linkedKeyFrameSeq.length === 1) {
        return linkedKeyFrameSeq[0]
    }

    for (const keyFrameLink of linkedKeyFrameSeq) {
        if (
            keyFrameLink.next == null ||
            (keyFrameLink.active.frameOnClip <= frame && frame < keyFrameLink.next.frameOnClip) ||
            (keyFrameLink.previous == null && frame < keyFrameLink.active.frameOnClip)
        ) {
            return keyFrameLink
        }
    }

    return null
}

//
// Typed keyframe calculators
//

function calcPoint2dKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): {x: number, y:number}
{
    const xVector = keyFrameLink.next!.value.x - keyFrameLink.active.value.x
    const yVector = keyFrameLink.next!.value.y - keyFrameLink.active.value.y

    return {
        x: keyFrameLink.active.value.x + (xVector * rate),
        y: keyFrameLink.active.value.y + (yVector * rate),
    }
}

function calcPoint3dKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): {x: number, y: number, z: number}
{
    const xVector = keyFrameLink.next!.value.x - keyFrameLink.active.value.x
    const yVector = keyFrameLink.next!.value.y - keyFrameLink.active.value.y
    const zVector = keyFrameLink.next!.value.z - keyFrameLink.active.value.z

    return {
        x: keyFrameLink.active.value.x + (xVector * rate),
        y: keyFrameLink.active.value.y + (yVector * rate),
        z: keyFrameLink.active.value.z + (zVector * rate),
    }
}

function calcSize2dKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): {width: number, height: number}
{
    const widthVector = keyFrameLink.next!.value.width - keyFrameLink.active.value.width
    const heightVector = keyFrameLink.next!.value.height - keyFrameLink.active.value.height

    return {
        width: keyFrameLink.active.value.width + (widthVector * rate),
        height: keyFrameLink.active.value.height + (heightVector * rate),
    }
}

function calcSize3dKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): {width: number, height: number, depth: number}
{
    const widthVector = keyFrameLink.next!.value.width - keyFrameLink.active.value.width
    const heightVector = keyFrameLink.next!.value.height - keyFrameLink.active.value.height
    const depthVector = keyFrameLink.next!.value.depth - keyFrameLink.active.value.depth

    return {
        width: keyFrameLink.active.value.width + (widthVector * rate),
        height: keyFrameLink.active.value.height + (heightVector * rate),
        depth: keyFrameLink.active.value.depth + (depthVector * rate),
    }
}

function calcColorRgbKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): {red: number, green: number, blue: number}
{
    const redVector = keyFrameLink.next!.value.red - keyFrameLink.active.value.red
    const greenVector = keyFrameLink.next!.value.green - keyFrameLink.active.value.green
    const blueVector = keyFrameLink.next!.value.blue - keyFrameLink.active.value.blue

    return {
        red: keyFrameLink.active.value.red + (redVector * rate),
        green: keyFrameLink.active.value.green + (greenVector * rate),
        blue: keyFrameLink.active.value.blue + (blueVector * rate),
    }
}

function calcColorRgbaKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): {red:number, green: number, blue: number, alpha: number}
{
    const redVector = keyFrameLink.next!.value.red - keyFrameLink.active.value.red
    const greenVector = keyFrameLink.next!.value.green - keyFrameLink.active.value.green
    const blueVector = keyFrameLink.next!.value.blue - keyFrameLink.active.value.blue
    const alphaVector = keyFrameLink.next!.value.alpha - keyFrameLink.active.value.alpha

    return {
        red: keyFrameLink.active.value.red + (redVector * rate),
        green: keyFrameLink.active.value.green + (greenVector * rate),
        blue: keyFrameLink.active.value.blue + (blueVector * rate),
        alpha: keyFrameLink.active.value.alpha + (alphaVector * rate),
    }
}

function calcBoolKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): boolean
{
    return keyFrameLink.previous ? !!keyFrameLink.previous.value : !!keyFrameLink.active.value
}

function calcStringKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): string
{
    return keyFrameLink.previous ? keyFrameLink.previous.value : keyFrameLink.active.value
}

function calcNumberKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): number
{
    const numVector = keyFrameLink.next!.value - keyFrameLink.active.value
    return keyFrameLink.active.value + (numVector * rate)
}

function calcFloatKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): number
{
    const floatVector = keyFrameLink.next!.value - keyFrameLink.active.value
    return keyFrameLink.active.value + (floatVector * rate)
}

function calcPulseKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): boolean
{
    return keyFrameLink.active.frameOnClip === frame ? true : false
}

function calcEnumKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): any
{
    return keyFrameLink.previous ? keyFrameLink.previous.value : keyFrameLink.active.value
}

function calcClipKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): any // TODO: Typing
{
    return keyFrameLink.previous ? keyFrameLink.previous.value : keyFrameLink.active.value
}

function calcAssetKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): Asset
{
    return keyFrameLink.previous ? keyFrameLink.previous.value : keyFrameLink.active.value
}

function calcNoAnimatable(rate: number, frame: number, keyFrameLink: KeyFrameLink): any
{
    return keyFrameLink.active.value
}

function calcArrayOfKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): any // TODO: Typing
{
}
