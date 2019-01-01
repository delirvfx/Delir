import * as Delir from '@ragg/delir-core'

export const hasErrorInClip = (clip: Delir.Entity.Clip, error: Delir.Exceptions.UserCodeException | null) => {
    if (!error) return false
    if (error.location.type === 'clip' && error.location.entityId === clip.id) return true
    return error.location.type === 'effect' && !!clip.effects.find(effect => error.location.entityId === effect.id)
}
