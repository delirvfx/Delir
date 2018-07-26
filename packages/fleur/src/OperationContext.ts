import { ActionIdentifier } from './ActionIdentifier'
import AppContext from './AppContext'
import { Operation, OperationArg } from './Operations'
import { StoreClass } from './Store'

class OperationContext<Actions extends ActionIdentifier<any>> {
    constructor(private context: AppContext) {}

    public async executeOperation<O extends Operation<Actions>>(operator: O, arg: OperationArg<O> ): Promise<void> {
        operator(this, arg)
    }

    public getStore<T extends StoreClass>(storeClass: T): InstanceType<T> {
        return this.context.getStore(storeClass)
    }

    public dispatch<AI extends Actions>(type: AI, payload: ReturnType<AI>): void {
        this.context.dispatch(type, payload)
    }
}

export { OperationContext as default }
