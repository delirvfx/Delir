import { operation } from '@ragg/fleur'
import EditorStore from '../store/EditorStore'
import acts, { Actions } from './action'

export const increment = operation<Actions>((ctx) => {
    ctx.dispatch(acts.increment, { increase: 1 })
    ctx.dispatch(acts.increment, {                decrease: 1 })
})

export const decrease = operation<Actions>((ctx, arg: { decrease: number }) => {
    ctx.dispatch(acts.decrement, { decrease: 1 })
})
