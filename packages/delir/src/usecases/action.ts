import { Action } from '@ragg/fleur'
import { decrease } from './usecases'

// type FirstArg<T> = T extends (arg: infer A) => any ? A : never
// type ActionGenarator<P> = (payload: P) => { payload: P }
// type ActionGroup<T> = { [K in keyof T]: ((arg: FirstArg<T[K]>) => { payload: FirstArg<T[K]> } & { type: K }) & {type: symbol} }

// const action = <P>() => (payload: P) => ({ payload })

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

export type KnownActions =
 | IncreaseAction
 | DecreaseAction

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
