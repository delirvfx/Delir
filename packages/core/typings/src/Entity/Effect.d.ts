import { Branded } from '../helper/Branded'
import { Animatable } from './Animatable'
export interface EffectProps {
    id?: string
    processor: string
    referenceName?: string | null
}
declare type EffectId = Branded<string, 'Entity/Effect/Id'>
declare class Effect extends Animatable implements EffectProps {
    public id: Effect.Id
    public processor: string
    public referenceName: string | null
    constructor(props: EffectProps)
    public patch(props: Partial<EffectProps>): void
}
declare namespace Effect {
    type Id = EffectId
}
export { Effect }
