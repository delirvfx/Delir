import immer from 'immer'

import { Action } from 'index'
import Emitter from './Emitter'

interface Events {
    onChange: never
}

export interface StoreClass<T = {}> { new(...args: any[]): Store<T> }

// type TypeOf<T> = T extends { type: infer Type } ? Type : never
type PayloadType<A extends Action<any>, T extends string> = A extends Action<T> ? A.payload : never

interface StoreOptions < A extends Action < any > , S > {
    rehydrate?(state: S): void
    dehydrate?(): S
    handlers: {
        [K in A.type]?: (arg: Payload) => void
    }
    // [prop: string]: any
}

export const createStore = <Actions extends Action<any>, S = {}>(options: StoreOptions<Actions, S>) => {

}

export default class Store<T = any> extends Emitter<Events> {
    protected state: T

    public emitChange(): void {
        this.emit('onChange')
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
