import immer, { Draft } from 'immer'

import { ActionIdentifier, ExtractPayloadType } from './ActionIdentifier'
import Emitter from './Emitter'

export interface StoreClass<T = {}> {
    storeName: string
    new(...args: any[]): Store<T>
}

export const listen = <A extends ActionIdentifier<any>>(action: A, producer: (payload: ExtractPayloadType<A>) => void) => ({
    __fleurHandler: true,
    __action: action,
    producer,
})

export interface StoreEvents {
    onChange: void
}

export default class Store<T = any> extends Emitter<StoreEvents> {
    public static storeName: string = ''

    protected state: T

    public rehydrate(state: T): void {
        this.state = state
    }

    public dehydrate(): T {
        return this.state
    }

    protected emitChange(): void {
        this.emit('onChange', void 0)
    }

    protected updateWith(producer: (draft: Draft<T>) => void): void {
        this.state = immer(this.state, draft => { producer(draft) })
        this.emitChange()
    }
}
