import AppContext from 'AppContext'
import { Operation, OperationArg } from 'Operations'
import Store from 'Store'

export default class ComponentContext {
    constructor(private context: AppContext) {}

    public executeOperation = <T extends Operation<any>>(operation: T, arg: OperationArg<T>): void => {
        this.context.executeOperation(operation, arg)
    }

    public getStore = <T extends Store>(StoreClass: { new(...args: any[]): T}): T => {
        return this.context.getStore(StoreClass)
    }
}
