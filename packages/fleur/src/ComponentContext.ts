import { ActionCreator, ActionCreatorArg } from 'ActionCreator'
import AppContext from 'AppContext'
import Store from 'Store'

export default class ComponentContext {
    constructor(private context: AppContext) {}

    public executeAction = <T extends ActionCreator<any>>(actionCreator: T, arg: ActionCreatorArg<T>): void => {
        this.context.executeAction actionCreator(this.context.actionContext, arg)). catch (e => {
            throw e
        })
    }

    public getStore = <T extends Store>(StoreClass: { new(...args: any[]): T}): T => {
        return this.context.getStore(StoreClass)
    }
}
