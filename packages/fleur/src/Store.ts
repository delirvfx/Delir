import Emitter from './Emitter'

interface Events {
    onChange: void
}

export interface StoreClass<T = {}> { new(...args: any[]): Store<T> }

export default class Store<T = {}> extends Emitter<Events> {
    public rehydrate(state: T): void {}

    public dehydrate(): T {
        return {} as T
    }
}
