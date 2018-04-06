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

export const increment: ActionCreator<KnownActions> = (ctx, arg: { increase: number }) => {
    ctx.dispatch({type: 'INCREASE', payload: {  } })
}

export const decrease = actionCreator((ctx, arg: { decrease: number }) => {
    // ctx.getStore(EditorStore).getState
    ctx.dispatch({type: 'DECREASE'})
})
