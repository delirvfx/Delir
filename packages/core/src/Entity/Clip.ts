import * as uuid from 'uuid'
import { AvailableRenderer } from '../Engine/Renderer'
import { Branded } from '../helper/Branded'
import { safeAssign } from '../helper/safeAssign'
import { Animatable } from './Animatable'
import { Effect } from './Effect'

interface ClipProps {
    id?: string
    renderer: string
    placedFrame: number
    durationFrames: number
}

type ClipId = Branded<string, 'Entity/Clip/Id'>

class Clip extends Animatable implements ClipProps {
    public id: Clip.Id
    public renderer: AvailableRenderer
    public placedFrame: number
    public durationFrames: number
    public effects: ReadonlyArray<Effect> = []

    constructor(props: ClipProps) {
        super()

        this.id = uuid.v4() as Clip.Id
        safeAssign<Clip>(this, props as ClipProps & { id: Clip.Id })
        this.normalize()
    }

    public patch(props: Partial<ClipProps>) {
        safeAssign(this, props)
    }

    public findEffect(effectId: string): Effect | null {
        return this.effects.find(effect => effect.id === effectId) || null
    }

    public addEffect(effect: Effect, index: number | null = null): void {
        if (index == null) {
            this.effects = [...this.effects, effect]
            return
        }

        const clone = [...this.effects]
        clone.splice(index, 0, effect)
        this.effects = clone
    }

    public removeEffect(effectId: string): boolean {
        const beforeLength = this.effects.length
        this.effects = this.effects.filter(effect => effect.id !== effectId)
        return this.effects.length !== beforeLength
    }

    public moveEffectIndex(effectId: string, newIndex: number): boolean {
        const index = this.effects.findIndex(effect => effect.id === effectId)
        if (index === -1) return false

        const clone = [...this.effects]
        clone.splice(newIndex, 0, ...clone.splice(index, 1))
        this.effects = clone
        return true
    }

    private normalize() {
        this.placedFrame = Math.round(this.placedFrame)
        this.durationFrames = Math.round(this.durationFrames)
    }
}

namespace Clip {
    export type Id = ClipId
}

export { Clip }
