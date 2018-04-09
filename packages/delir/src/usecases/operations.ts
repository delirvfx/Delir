import { Action, ActionContext, actionCreator, ActionCreator, operations } from '@ragg/fleur'
// import { Action } from '@ragg/fleur/lib/Action'
import EditorStore from '../store/EditorStore'
import acts, { KnownActions } from './action'

// import Actions from './action'

// const drawRect = actionCreator((ctx, arg: { x: number, y: number }) => {
//     // ctx.getStore(EditorStore).getState()
//     ctx.executeActon(drawRect, { x: 1, y: 1, z: 1 })
//     ctx.dispatch({})
// })

// // const action =
// type DrawRectAction = typeof Action<'DrawRect', {}>

export const increment = actionCreator<typeof acts>((ctx, arg: { increase: number }) => {
    // ctx.dispatch({type: 'INCREASE', error: false, payload: { increase: 1 } })
    ctx.dispatch(acts.increment, {
        increase: 1
    })
})

export const decrease = actionCreator<KnownActions>((ctx, arg: { decrease: number }) => {
    // ctx.getStore(EditorStore).getState
    ctx.dispatch({type: 'DECREASE', error: true, payload: new Error('') })
})
