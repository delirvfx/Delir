import { Action } from './Action'
import { ActionCreator, ActionCreatorArg } from './ActionCreator'
import AppContext from './AppContext'
import Store from './Store'

export default class ActionContext<Actions extends Action<any, any, any, any>> {
    constructor(private context: AppContext) {}

    public async executeActon<AC extends ActionCreator<any>>(actionCreator: AC, arg: ActionCreatorArg<AC> ): Promise<void> {
        actionCreator(this, arg)
    }

    public getStore<T extends Store>(storeClass: { new(...args: any[]): T }): T {
        return this.context.getStore(storeClass)
    }

    public dispatch<_Actions = Actions>(action: _Actions): void {
        this.context.dispatchr.dispatch(action)
    }
}
