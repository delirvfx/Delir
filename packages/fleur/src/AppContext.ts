import * as invariant from 'invariant'

import {  ActionIdentifier, ExtractPayloadType } from './ActionIdentifier'
import ComponentContext from './ComponentContext'
import Dispatcher from './Dispatcher'
import Fleur from './Fleur'
import OperationContext from './OperationContext'
import { Operation, OperationArg } from './Operations'
import Store, { StoreClass } from './Store'

interface HydrateState {
    stores: { [storeName: string]: object }
}

export default class AppContext<Actions extends ActionIdentifier<any> = ActionIdentifier<any>> {
    public dispatcher: Dispatcher
    public actionContext: OperationContext<any>
    public componentContext: ComponentContext
    public stores: Map<StoreClass, Store<any>> = new Map()
    public actionCallbackMap: Map<StoreClass, Map<ActionIdentifier<any>, (payload: any) => void>> = new Map()

    constructor(private app: Fleur) {
        this.dispatcher = new Dispatcher()
        this.actionContext = new OperationContext(this)
        this.componentContext = new ComponentContext(this)
    }

    public dehydrate(): HydrateState {
        const state = { stores: {} }

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
                this.stores.get(StoreClass).rehydrate(state.stores[StoreClass.name])
            }
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
        await Promise.resolve(operation(this.actionContext, arg))
    }

    public dispatch<A extends Actions>(actionIdentifier: A, payload: ExtractPayloadType<A>) {
        this.dispatcher.dispatch(actionIdentifier, payload)
    }

    private initializeStore(StoreClass: StoreClass<any>) {
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
