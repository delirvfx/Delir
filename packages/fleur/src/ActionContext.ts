import Fleur from '.'
import Store, { StoreConstructor } from './Store'
import { Action } from './Action'
import { ActionCreator } from './ActionCreator'

type FirstArg<T> = T extends ((arg: infer A) => void) ? A : never

export default class ActionContext<Actions extends Action<any, any, any, any>> {
    constructor(private fleurContext: Fleur) {}

    public async executeActon<AC extends ActionCreator>(actionCreator: AC, payload: FirstArg<AC> ): Promise<void> {
        actionCreator(this, payload)
    }

    public getStore<T extends StoreConstructor>(store: T) {
        this.fleurContext.getStore(store)
    }

    public dispatch(action: Actions): void {

    }
}
