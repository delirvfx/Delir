import ActionContext from './ActionContext'

export interface ActionCreator {
    <T extends object>(context: ActionContext<any>, arg: T): Promise<void> | void
}
