import AppContext from './AppContext'
import { StoreClass } from './Store'

export interface FleurOption {
    stores?: StoreClass[]
}

export default class Fleur {
    public stores: Set<StoreClass>

    constructor(options: FleurOption = {}) {
        this.stores = new Set(options.stores || [])
    }

    public registerStore(Store: StoreClass<any>): void {
        this.stores.add(Store)
    }

    public createContext(): AppContext {
        return new AppContext(this)
    }
}
