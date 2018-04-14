import { action } from '@ragg/fleur'

const acts = {
    increment: action<{ increase: number }>(),
    decrement: action<{ decrease: number }>(),
}

export type Actions = typeof acts
export default acts
