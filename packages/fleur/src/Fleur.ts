import AppContext from './AppContext'
import { StoreClass } from './Store'

export default class Fleur {
    public stores: { [storeName: string]: StoreClass<any> }

    public registerStore(Store: StoreClass<any>): void {
        this.stores[Store.name] = Store
    }

    public createContext(): AppContext {
        return new AppContext(this)
    }
}
