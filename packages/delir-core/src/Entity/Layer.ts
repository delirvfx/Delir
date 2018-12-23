import * as uuid from 'uuid'

import { Branded } from '../helper/Branded'
import { safeAssign } from '../helper/safeAssign'
import { Clip } from './Clip'

interface LayerProps {
    id?: string
    name: string
}

type LayerId = Branded<string, 'Entity/Layer/Id'>

class Layer implements LayerProps {
    public id: Layer.Id
    public name: string
    public clips: ReadonlyArray<Clip> = []

    constructor(props: LayerProps) {
        this.id = uuid.v4() as Layer.Id
        safeAssign<Layer>(this, props as LayerProps & { id: Layer.Id })
    }

    public patch(props: Partial<LayerProps>) {
        safeAssign(this, props)
    }

    public findClip(clipId: string): Clip | null {
        return this.clips.find(clip => clip.id === clipId) || null
    }

    public findClipAt(frame: number, durationFrame: number = 0): Clip | null {
        const targetEndFrame = frame + durationFrame

        for (const clip of this.clips) {
            const endFrame = clip.durationFrames + clip.placedFrame
            if (clip.placedFrame <= frame && endFrame >= frame) return clip
            if (clip.placedFrame <= endFrame && endFrame >= targetEndFrame) return clip
        }

        return null
    }

    public addClip(clip: Clip): boolean {
        // Check duplication in a time
        // if (this.findClipAt(clip.placedFrame)) return false
        this.clips = [...this.clips, clip].sort((a, b) => a.placedFrame - b.placedFrame)
        return true
    }

    public removeClip(clipId: string): boolean {
        const beforeLength = this.clips.length
        this.clips = this.clips.filter(clip => clip.id !== clipId)
        return this.clips.length !== beforeLength
    }

    public moveClipIntoLayer(clipId: string, destLayer: Layer): boolean {
        const clip = this.findClip(clipId)
        if (!clip) return false

        this.removeClip(clip.id)
        destLayer.addClip(clip)
        return true
    }
}

namespace Layer {
    export type Id = LayerId
}

export { Layer }
