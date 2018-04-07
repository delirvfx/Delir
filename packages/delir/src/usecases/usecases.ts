import { Action, ActionContext, actionCreator, ActionCreator } from '@ragg/fleur'
// import { Action } from '@ragg/fleur/lib/Action'
import EditorStore from '../store/EditorStore'
import { KnownActions } from './action'

// import Actions from './action'

// const drawRect = actionCreator((ctx, arg: { x: number, y: number }) => {
//     // ctx.getStore(EditorStore).getState()
//     ctx.executeActon(drawRect, { x: 1, y: 1, z: 1 })
//     ctx.dispatch({})
// })

// // const action =
// type DrawRectAction = typeof Action<'DrawRect', {}>

export const increment = actionCreator<KnownActions>((ctx, arg: { increase: number }) => {
    // ctx.dispatch({type: 'INCREASE', error: false, payload: { increase: 1 } })
    ctx.dispatch({type: 'INCREASE', error: false, payload: { decrease: 1, increase: 1 } })
})

export const decrease = actionCreator<KnownActions>((ctx, arg: { decrease: number }) => {
    // ctx.getStore(EditorStore).getState
    ctx.dispatch({type: 'DECREASE', error: true, payload: new Error('') })
})
