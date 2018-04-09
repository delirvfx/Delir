import { action, actions } from '@ragg/fleur'

const acts = actions({
    increment: action<{ increase: number }>(),
    decrement: action<{ decrease: number }>(),
})

export type Actions = typeof acts
export default acts
