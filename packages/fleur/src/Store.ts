import immer from 'immer'

import { Action, ActionIdentifier, ExtractPayloadType } from './Action'
import Emitter from './Emitter'

interface StoreEvents {
    onChange: never
}

export interface StoreClass<T = {}> { new(...args: any[]): Store<T> }

interface StoreOptions < A extends Action < any > , S > {
    rehydrate?(state: S): void
    dehydrate?(): S
    [prop: string]: any
}

export const createStore = <Actions extends Action<any>, S = {}>(options: StoreOptions<Actions, S>) => {

}

export const listen = <A extends ActionIdentifier<any>>(_action: A, producer: (payload: ExtractPayloadType<A>) => void): void => producer
}

export default class Store<T = any> extends Emitter<StoreEvents> {
    public state: T

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
