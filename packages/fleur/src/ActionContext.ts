import { OperationArg } from 'Operations'
import { Action, ExtractPayloadType, PayloadTypeStore } from './Action'
import { ActionCreator } from './ActionCreator'
import AppContext from './AppContext'
import Store from './Store'

export default class ActionContext<Actions extends Action<any, any>> {
    constructor(private context: AppContext) {}

    public async executeActon<AC extends ActionCreator<any>>(actionCreator: AC, arg: OperationArg<AC> ): Promise<void> {
        actionCreator(this, arg)
    }

    public getStore<T extends Store>(storeClass: { new(...args: any[]): T }): T {
        return this.context.getStore(storeClass)
    }

    public dispatch<AI extends PayloadTypeStore<any>>(type: AI, payload: ReturnType<AI>): void {
        this.context.dispatcher.dispatch(type, payload)
    }
}
