import * as clamp from 'lodash/clamp'
import * as uuid from 'uuid'

import { Branded } from '../helper/Branded'
import { safeAssign } from '../helper/safeAssign'
import AssetPointer from '../Values/AssetPointer'
import ColorRGB from '../Values/ColorRGB'
import ColorRGBA from '../Values/ColorRGBA'
import Expression from '../Values/Expression'

export type KeyframeValueTypes = number | boolean | string | ColorRGB | ColorRGBA | Expression | AssetPointer | null

interface KeyframeProps {
    id?: string,
    value: KeyframeValueTypes
    frameOnClip: number
    easeInParam?: [number, number]
    easeOutParam?: [number, number]
}

type KeyframeId = Branded<string, 'Entity/Keyframe/Id'>

class Keyframe<T extends KeyframeValueTypes = KeyframeValueTypes> implements KeyframeProps {
    public id: Keyframe.Id
    public value: T
    public frameOnClip: number

    /**
     * right top is [1, 1] ([x, y])
     *     ◇ < previous keyframe to this keyframe
     * ◇───┘ < ease-in
     */
    public easeInParam: [number, number] = [1, 1]

    /**
     * left bottom is [0, 0] ([x, y])
     *     ◇ < next keyframe
     * ◇───┘ < this keyframe to next keyframe, ease-out
     */
    public easeOutParam: [number, number] = [0, 0]

    constructor(props: KeyframeProps) {
        this.id = uuid.v4() as Keyframe.Id
        safeAssign<Keyframe>(this, props as KeyframeProps & { id: Keyframe.Id })
        this.normalize()
    }

    public patch(props: Partial<KeyframeProps>) {
        safeAssign<Keyframe>(this, props as Keyframe)
        this.normalize()
    }

    private normalize() {
        this.frameOnClip = Math.round(this.frameOnClip)

        this.easeInParam = [
            clamp(this.easeInParam[0], 0, 1),
            this.easeInParam[1]
        ]

        this.easeOutParam = [
            clamp(this.easeOutParam[0], 0, 1),
            this.easeOutParam[1],
        ]
    }

}

namespace Keyframe {
    export type Id = KeyframeId
}

export { Keyframe }
