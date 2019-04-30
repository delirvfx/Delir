import { AvailableRenderer } from '../Engine/Renderer'
import { Branded } from '../helper/Branded'
import { Animatable } from './Animatable'
import { Effect } from './Effect'
interface ClipProps {
    id?: string
    renderer: string
    placedFrame: number
    durationFrames: number
}
declare type ClipId = Branded<string, 'Entity/Clip/Id'>
declare class Clip extends Animatable implements ClipProps {
    public id: Clip.Id
    public renderer: AvailableRenderer
    public placedFrame: number
    public durationFrames: number
    public effects: ReadonlyArray<Effect>
    private normalize
    constructor(props: ClipProps)
    public patch(props: Partial<ClipProps>): void
    public findEffect(effectId: string): Effect | null
    public addEffect(effect: Effect, index?: number | null): void
    public removeEffect(effectId: string): boolean
    public moveEffectIndex(effectId: string, newIndex: number): boolean
}
declare namespace Clip {
    type Id = ClipId
}
export { Clip }
