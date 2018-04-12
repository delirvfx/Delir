import immer from 'immer'

import Payload from '../../../alpha4/src/frontend/utils/Flux/Payload'
import { ActionIdentifier, ExtractPayloadType } from './ActionIdentifier'
import Emitter from './Emitter'

export interface StoreClass<T = {}> { new(...args: any[]): Store<T> }

export const listen = <A extends ActionIdentifier<any>>(action: A, producer: (payload: ExtractPayloadType<A>) => void) => ({
    __fleurHandler: true,
    __action: action,
    producer,
})

interface StoreEvents {
    onChange: void
}

export default class Store<T = any> extends Emitter<StoreEvents> {
    public state: T

    public emitChange(): void {
        this.emit('onChange', null)
    }

    public rehydrate(state: T): void {
        this.state = state
    }

    public dehydrate(): T {
        return this.state
    }

    protected produce(producer: (draft: T) => void): void {
        this.state = immer(this.state, draft => { producer(draft) })
        this.emitChange()
    }
}
