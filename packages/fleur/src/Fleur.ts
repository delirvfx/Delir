import * as invariant from 'invariant'

import AppContext from './AppContext'
import { StoreClass } from './Store'

export interface FleurOption {
    stores?: StoreClass[]
}

export default class Fleur {
    public stores: Set<StoreClass> = new Set()

    constructor(options: FleurOption = {}) {
        if (options.stores) {
            options.stores.forEach(StoreClass => this.registerStore(StoreClass))
        }
    }

    public registerStore(Store: StoreClass<any>): void {
        if (typeof Store.storeName !== 'string' || Store.storeName === '') {
            console.error('Store.storeName must be specified.', Store)
            throw new Error('Store.storeName must be specified.')
        }

        const storeRegistered = [...this.stores].find(StoreClass => StoreClass.storeName === Store.storeName)
        invariant(!storeRegistered, `Store ${Store.storeName} already registered.`)

        this.stores.add(Store)
    }

    public createContext(): AppContext {
        return new AppContext(this)
    }
}
