import { SVGObject } from './Objects/SVGObject'

interface Keyframe<T extends SVGObject> {
    uuid: string
    seconds: number
    patch: Partial<T>
}

export class Timeline {
    public objects: SVGObject
    public keyframes: Keyframe<any>[] = []

    public addKeyframe<T extends SVGObject>(uuid: string, seconds: number, patch: Partial<T>) {
        this.keyframes.push({ uuid, seconds, patch })
    }
}
