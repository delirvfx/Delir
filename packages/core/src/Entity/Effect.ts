import uuid from 'uuid'

import { Branded } from '../helper/Branded'
import { safeAssign } from '../helper/safeAssign'
import { Animatable } from './Animatable'

export interface EffectProps {
  id?: string
  processor: string
  referenceName?: string | null
}

type EffectId = Branded<string, 'Entity/Effect/Id'>

class Effect extends Animatable implements EffectProps {
  public id: Effect.Id
  public processor: string
  public referenceName: string | null = null

  constructor(props: EffectProps) {
    super()

    this.id = uuid.v4() as Effect.Id
    safeAssign<Effect>(this, props as EffectProps & { id: Effect.Id })
  }

  public patch(props: Partial<EffectProps>) {
    safeAssign(this, props)
  }
}

namespace Effect {
  export type Id = EffectId
}

export { Effect }
