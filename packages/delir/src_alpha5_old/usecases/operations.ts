import { operation } from '@ragg/fleur'
import EditorStore from '../store/EditorStore'
import acts, { Actions } from './action'

export const increment = operation<Actions>((ctx, arg: { increases: number }) => {
    ctx.dispatch(acts.increment, { increase: arg.increases })
})

export const decrease = operation<Actions>((ctx, arg: { decrease: number }) => {
    ctx.dispatch(acts.decrement, { decrease: 1 })
})
