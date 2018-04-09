import { Action, action, ActionContext, ActionCreator, actions, operations, ThrowableAction } from '@ragg/fleur'
import { decrease } from './usecases'

type FirstArg<T> = T extends (arg: infer A) => any ? A : never
// type ActionGenarator<P> = (payload: P) => { payload: P }
// type ActionGroup<T> = { [K in keyof T]: ((arg: FirstArg<T[K]>) => { payload: FirstArg<T[K]> } & { type: K }) & {type: symbol} }

// const action = <P>() => (payload: P): P => { throw new Error('Do not call Action as function') }

// const actions = <T extends { [action: string]: ActionGenarator<any>　}>(actions: T): ActionGroup<T> => {
//     const wrap: any = Object.create(null)
//     Object.keys(actions).forEach(k => {
//         wrap[k] = (payload) => ({ type: k, payload: actions[k](payload) })
//         wrap[k].type = Symbol(actions[k].name)
//     })
//     return wrap
// }

// type ActionsOf<T> = T extends (type: infer T, payload: infer P) ?

// export type Actions =
//  | Action<'INCREMENT', { increase: number }>
// //  | Action<'DECREMENT', {}>

type IncreaseAction = Action<'INCREASE', { increase: number }>
type DecreaseAction = Action<'DECREASE', { decrease: number }>

// export type KnownActions =
// //  | IncreaseAction
//     | { type: 'INCREASE', payload: { increase: number }, error?: false, meta?: never }
// //  | DecreaseAction
//     | { type: 'DECREASE', payload: { decrease: number }, error?: false, meta?: never }

const acts = actions({
    increment: action<{ increase: number }>(),
    decrement: action<{ decrease: number }>(),
})

export default acts

// const acts = actions({
//     increase: action<{ increase: number }>(),
//     decrease: action<{decrease: number}>(),
// })

// // const actions = {

// // }

// const a = acts.decrease({decrease: 1})
// a.type
// a.payload.decrease

// export default acts

// export const
