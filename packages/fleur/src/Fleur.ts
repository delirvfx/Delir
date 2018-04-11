import { ActionIdentifier } from 'Action'
import AppContext from './AppContext'
import { StoreClass } from './Store'

export default class Fleur {
    public stores: Set<StoreClass> = new Set()

    public registerStore(Store: StoreClass<any>): void {
        this.stores.add(Store)
    }

    public createContext(): AppContext {
        return new AppContext(this)
    }
}
