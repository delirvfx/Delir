import Dispatcher from './Dispatcher'
import Store, { StoreConstructor, InstanceOf } from './Store'

export default class Fleur {
    private stores: { [storeName: string]: Store }

    public dispatcher: Dispatcher = new Dispatcher()

    public registerStore(store: StoreConstructor): void {
        this.stores[store.name] = new Store()
    }

    public getStore<T extends StoreConstructor>(store: T): InstanceOf<T> {
        return this.stores[store.name]
    }
}
