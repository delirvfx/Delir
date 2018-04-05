import { ActionCreator, ActionCreatorArg } from 'ActionCreator'
import AppContext from 'AppContext'

export default class ComponentContext {
    constructor(private context: AppContext) {}

    public executeAction = <T extends ActionCreator<any>>(actionCreator: T, arg: ActionCreatorArg<T>): void => {
        actionCreator(this.context.actionContext, arg)
    }
}
