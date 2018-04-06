import { Action } from 'index'
import ActionContext from './ActionContext'

// export type ActionCreatorArg<T extends ActionCreator<any>> = T extends ActionCreator < infer A > ? A : never

export interface ActionCreator<Actions extends Action<any>> {
    (context: ActionContext<Actions>, arg: any): Promise<void> | void
}

const actionCreator = <Actions extends Action<any>>(ac) => ac
export { actionCreator as default }
