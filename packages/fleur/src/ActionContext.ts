import { Operation, OperationArg } from 'Operations'
import { ActionIdentifier } from './Action'
import AppContext from './AppContext'
import Store from './Store'

class ActionContext<Actions extends ActionIdentifier<any>> {
    constructor(private context: AppContext) {}

    public async executeOperation<O extends Operation<Actions>>(operator: O, arg: OperationArg<O> ): Promise<void> {
        operator(this, arg)
    }

    public getStore<T extends Store>(storeClass: { new(...args: any[]): T }): T {
        return this.context.getStore(storeClass)
    }

    public dispatch<AI extends Actions>(type: AI, payload: ReturnType<AI>): void {
        this.context.dispatch(type, payload)
    }
}

export { ActionContext as default }
