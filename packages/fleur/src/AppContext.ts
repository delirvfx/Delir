import * as invariant from 'invariant'

import {  ActionIdentifier, ExtractPayloadType } from './ActionIdentifier'
import ComponentContext from './ComponentContext'
import Dispatcher from './Dispatcher'
import Fleur from './Fleur'
import OperationContext from './OperationContext'
import { Operation, OperationArg } from './Operations'
import Store, { StoreClass } from './Store'

export interface HydrateState {
    stores: { [storeName: string]: object }
}

export default class AppContext<Actions extends ActionIdentifier<any> = ActionIdentifier<any>> {
    public readonly dispatcher: Dispatcher
    public readonly operationContext: OperationContext<any>
    public readonly componentContext: ComponentContext
    public readonly stores: Map<StoreClass, Store<any>> = new Map()
    public readonly actionCallbackMap: Map<StoreClass, Map<ActionIdentifier<any>, (payload: any) => void>> = new Map()

    constructor(private app: Fleur) {
        this.dispatcher = new Dispatcher()
        this.operationContext = new OperationContext(this)
        this.componentContext = new ComponentContext(this)
        this.app.stores.forEach((StoreClass) => { this.initializeStore(StoreClass) })
    }

    public dehydrate(): HydrateState {
        const state: HydrateState = { stores: {}  }

        this.stores.forEach((store, StoreClass) => {
            state.stores[StoreClass.name] = store.dehydrate()
        })

        return state
    }

    public rehydrate(state: HydrateState) {
        this.app.stores.forEach((StoreClass) => {
            if (!state.stores[StoreClass.name]) return

            if (!this.stores.has(StoreClass)) {
                this.initializeStore(StoreClass)
            }

            this.stores.get(StoreClass)!.rehydrate(state.stores[StoreClass.name])
        })
    }

    public getStore<T extends StoreClass<any>>(StoreClass: T): InstanceType<T> {
        if (process.env.NODE_ENV !== 'production') {
            const storeRegistered = this.app.stores.has(StoreClass)
            invariant(storeRegistered, `Store ${StoreClass.name} is must be registered`)
        }

        return (this.stores.get(StoreClass) as any) || this.initializeStore(StoreClass)
    }

    public async executeOperation<T extends Operation<Actions>>(operation: T, arg: OperationArg<T>): Promise<void> {
        await Promise.resolve(operation(this.operationContext, arg))
    }

    public dispatch<A extends Actions>(actionIdentifier: A, payload: ExtractPayloadType<A>) {
        this.dispatcher.dispatch(actionIdentifier, payload)
    }

    private initializeStore(StoreClass: StoreClass<any>) {
        if (process.env.NODE_ENV !== 'production') {
            const storeRegistered = this.app.stores.has(StoreClass)
            invariant(storeRegistered, `Store ${StoreClass.name} is must be registered`)
        }

        const store = new StoreClass()
        const actionCallbackMap = new Map()
        this.stores.set(StoreClass, store)

        Object.keys(store)
            .filter(key => (store as any)[key] != null && (store as any)[key].__fleurHandler)
            .forEach(key => {
                const actionIdentifier = (store as any)[key].__action

                if (process.env.NODE_ENV !== 'production') {
                    invariant(actionCallbackMap.has(actionIdentifier) === false, `Action handler duplicated in store '${StoreClass.name}'`)
                }

                actionCallbackMap.set(actionIdentifier, (store as any)[key].producer)
            })

        this.actionCallbackMap.set(StoreClass, actionCallbackMap)

        this.dispatcher.listen(action => {
            const actionCallbackMap = this.actionCallbackMap.get(StoreClass)!
            const handler = actionCallbackMap.get(action.type)
            handler && handler(action.payload)
        })

        return store
    }
}
