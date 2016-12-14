import Asset from '../project/asset'
import KeyFrame from '../project/keyframe'
import {
    TypeDescriptor,
} from '../plugin/type-descriptor'

import bezierEasing from 'bezier-easing'

interface KeyFrameLink {
    previous?: KeyFrame,
    active: KeyFrame,
    next?: KeyFrame,
}

interface KeyFrameSequence {
    [frame: number]: any
}

export default class KeyframeHelper
{
    static calcKeyFrames(
        paramTypes: TypeDescriptor,
        keyFrames: {[propName: string]: Array<KeyFrame>},
        beginFrame: number,
        calcFrames: number
    ): {[propName: string]: KeyFrameSequence}
    {
        const paramDescriptors = paramTypes.properties
        const tables: {[propName: string]: KeyFrameSequence} = {}

        for (const propDesc of paramTypes.properties) {
            const {propName} = propDesc

            switch (propDesc.type) {
                case 'POINT_2D':
                    tables[propName] = KeyframeHelper.calcKeyframe(keyFrames[propName], beginFrame, calcFrames, KeyframeHelper.calcPoint2dKeyFrames)
                break;
                case 'POINT_3D':
                    tables[propName] = KeyframeHelper.calcKeyframe(keyFrames[propName], beginFrame, calcFrames, KeyframeHelper.calcPoint3dKeyFrames)
                break;
                case 'SIZE_2D':
                    tables[propName] = KeyframeHelper.calcKeyframe(keyFrames[propName], beginFrame, calcFrames, KeyframeHelper.calcSize2dKeyFrames)
                break;
                case 'SIZE_3D':
                    tables[propName] = KeyframeHelper.calcKeyframe(keyFrames[propName], beginFrame, calcFrames, KeyframeHelper.calcSize3dKeyFrames)
                break;
                case 'COLOR_RGB':
                    tables[propName] = KeyframeHelper.calcKeyframe(keyFrames[propName], beginFrame, calcFrames, KeyframeHelper.calcColorRgbKeyFrames)
                break;
                case 'COLOR_RGBA':
                    tables[propName] = KeyframeHelper.calcKeyframe(keyFrames[propName], beginFrame, calcFrames, KeyframeHelper.calcColorRgbaKeyFrames)
                break;
                case 'BOOL':
                    tables[propName] = KeyframeHelper.calcKeyframe(keyFrames[propName], beginFrame, calcFrames, KeyframeHelper.calcBoolKeyFrames)
                break;
                case 'STRING':
                    tables[propName] = KeyframeHelper.calcKeyframe(keyFrames[propName], beginFrame, calcFrames, KeyframeHelper.calcStringKeyFrames)
                break;
                case 'NUMBER':
                    tables[propName] = KeyframeHelper.calcKeyframe(keyFrames[propName], beginFrame, calcFrames, KeyframeHelper.calcNumberKeyFrames)
                break;
                case 'FLOAT':
                    tables[propName] = KeyframeHelper.calcKeyframe(keyFrames[propName], beginFrame, calcFrames, KeyframeHelper.calcFloatKeyFrames)
                break;
                case 'ENUM':
                    tables[propName] = KeyframeHelper.calcKeyframe(keyFrames[propName], beginFrame, calcFrames, KeyframeHelper.calcEnumKeyFrames)
                break;
                case 'LAYER':
                    tables[propName] = KeyframeHelper.calcKeyframe(keyFrames[propName], beginFrame, calcFrames, KeyframeHelper.calcNoAnimatable)
                break;
                case 'PULSE':
                    tables[propName] = KeyframeHelper.calcKeyframe(keyFrames[propName], beginFrame, calcFrames, KeyframeHelper.calcPulseKeyFrames)
                break;
                case 'ARRAY':
                    tables[propName] = KeyframeHelper.calcKeyframe(keyFrames[propName], beginFrame, calcFrames, KeyframeHelper.calcArrayOfKeyFrames)
                break;
                case 'ASSET':
                    tables[propName] = KeyframeHelper.calcKeyframe(keyFrames[propName], beginFrame, calcFrames, KeyframeHelper.calcAssetKeyFrames)
                break;
            }
        }

        return tables
    }

    static calcKeyframe(
        keyFrameSequense: Array<KeyFrame>,
        beginFrame: number,
        calcFrames: number,
        transformer: (rate: number, frame: number, keyFrameLink: KeyFrameLink) => any
    ): KeyFrameSequence
    {
        const orderedSequense: Array<KeyFrame> = keyFrameSequense.slice(0).sort((kfA, kfB) => kfA.frameOnLayer - kfB.frameOnLayer)
        const linkedSequense: Array<KeyFrameLink> = KeyframeHelper._buildLinkedKeyFrame(orderedSequense)

        const table: KeyFrameSequence = {}

        for (let frame = beginFrame, end = beginFrame + calcFrames; frame <= end; frame++) {
            let activeKeyFrame: KeyFrameLink|null = KeyframeHelper._activeKeyFrameOfFrame(linkedSequense, frame)

            if (activeKeyFrame == null) {
                // TODO: default value
                table[frame] = null
                continue
            }

            if (activeKeyFrame.previous == null && frame < activeKeyFrame.active.frameOnLayer) {
                table[frame] = activeKeyFrame.active.value
                continue
            }

            if (activeKeyFrame.next == null && frame >= activeKeyFrame.active.frameOnLayer) {
                table[frame] = activeKeyFrame.active.value
                continue
            }

            const currentKeyEaseOut = activeKeyFrame.active.easeOutParam ? activeKeyFrame.active.easeOutParam : [0, 1]
            const nextKeyEaseIn = activeKeyFrame.next!.easeInParam ? activeKeyFrame.next!.easeInParam : [1, 0]
            // TODO: Cache Bezier instance between change active keyframe
            const bezier = bezierEasing(...currentKeyEaseOut, ...nextKeyEaseIn)

            const progressRate = (frame - activeKeyFrame.active.frameOnLayer) / (activeKeyFrame.next!.frameOnLayer - activeKeyFrame.active.frameOnLayer)
            table[frame] = transformer(bezier(progressRate), frame, activeKeyFrame)
        }

        return table
    }

    static _buildLinkedKeyFrame(orderedKeyFrameSeq: Array<KeyFrame>): Array<KeyFrameLink>
    {
        const linked = []
        let idx = 0
        for (const keyFrame of orderedKeyFrameSeq) {
            linked.push({
                previous: orderedKeyFrameSeq[idx - 1],
                active: orderedKeyFrameSeq[idx],
                next: orderedKeyFrameSeq[idx + 1],
            })
            idx++
        }
        return linked
    }

    static _activeKeyFrameOfFrame(linkedKeyFrameSeq: Array<KeyFrameLink>, frame: number): KeyFrameLink|null
    {
        if (linkedKeyFrameSeq.length === 1) {
            return linkedKeyFrameSeq[0]
        }

        for (const keyFrameLink of linkedKeyFrameSeq) {
            if (
                keyFrameLink.next == null ||
                (keyFrameLink.active.frameOnLayer <= frame && frame < keyFrameLink.next.frameOnLayer) ||
                (keyFrameLink.previous == null && frame < keyFrameLink.active.frameOnLayer)
            ) {
                return keyFrameLink
            }
        }

        return null
    }

    //
    // Typed keyframe calculators
    //

    static calcPoint2dKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): {x: number, y:number}
    {
        const xVector = keyFrameLink.next!.value.x - keyFrameLink.active.value.x
        const yVector = keyFrameLink.next!.value.y - keyFrameLink.active.value.y

        return {
            x: keyFrameLink.active.value.x + (xVector * rate),
            y: keyFrameLink.active.value.y + (yVector * rate),
        }
    }

    static calcPoint3dKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): {x: number, y: number, z: number}
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

    static calcSize2dKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): {width: number, height: number}
    {
        const widthVector = keyFrameLink.next!.value.width - keyFrameLink.active.value.width
        const heightVector = keyFrameLink.next!.value.height - keyFrameLink.active.value.height

        return {
            width: keyFrameLink.active.value.width + (widthVector * rate),
            height: keyFrameLink.active.value.height + (heightVector * rate),
        }
    }

    static calcSize3dKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): {width: number, height: number, depth: number}
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

    static calcColorRgbKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): {red: number, green: number, blue: number}
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

    static calcColorRgbaKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): {red:number, green: number, blue: number, alpha: number}
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

    static calcBoolKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): boolean
    {
        return keyFrameLink.previous ? !!keyFrameLink.previous.value : !!keyFrameLink.active.value
    }

    static calcStringKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): string
    {
        return keyFrameLink.previous ? keyFrameLink.previous.value : keyFrameLink.active.value
    }

    static calcNumberKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): number
    {
        const numVector = keyFrameLink.next!.value - keyFrameLink.active.value
        return keyFrameLink.active.value + (numVector * rate)
    }

    static calcFloatKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): number
    {
        const floatVector = keyFrameLink.next!.value - keyFrameLink.active.value
        return keyFrameLink.active.value + (floatVector * rate)
    }

    static calcPulseKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): boolean
    {
        return keyFrameLink.active.frameOnLayer === frame ? true : false
    }

    static calcEnumKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): any
    {
        return keyFrameLink.previous ? keyFrameLink.previous.value : keyFrameLink.active.value
    }

    static calcLayerKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): any // TODO: Typing
    {
        return keyFrameLink.previous ? keyFrameLink.previous.value : keyFrameLink.active.value
    }

    static calcAssetKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): Asset
    {
        return keyFrameLink.previous ? keyFrameLink.previous.value : keyFrameLink.active.value
    }

    static calcNoAnimatable(rate: number, frame: number, keyFrameLink: KeyFrameLink): any
    {
        return keyFrameLink.active.value
    }

    static calcArrayOfKeyFrames(rate: number, frame: number, keyFrameLink: KeyFrameLink): any // TODO: Typing
    {
    }
}
