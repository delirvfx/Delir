import ActionContext from './ActionContext'

export type ActionCreatorArg<T extends ActionCreator<any>> = T extends ActionCreator < infer A > ? A : never

export interface ActionCreator<T extends object> {
    (context: ActionContext<any>, arg: T): Promise<void> | void
}
