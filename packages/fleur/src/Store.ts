import immer from 'immer'

import Emitter from './Emitter'

interface Events {
    onChange: void
}

export interface StoreClass<T = {}> { new(...args: any[]): Store<T> }

export default class Store<T = any> extends Emitter<Events> {
    protected state: T

    public emitChange(): void {
        this.emit('onChange', void 0)
    }

    public rehydrate(state: T): void {
        this.state = state
    }

    public dehydrate(): T {
        return this.state
    }

    protected produce(producer: (draft: T) => void): void {
        this.state = immer(this.state, draft => { producer(draft) })
    }
}
