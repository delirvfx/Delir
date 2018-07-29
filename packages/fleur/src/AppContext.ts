import * as invariant from 'invariant'

import { ActionIdentifier, ExtractPayloadType } from './ActionIdentifier'
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
    public readonly stores: Map<string, Store<any>> = new Map()
    public readonly actionCallbackMap: Map<StoreClass, Map<ActionIdentifier<any>, ((payload: any) => void)[]>> = new Map()

    constructor(private app: Fleur) {
        this.dispatcher = new Dispatcher()
        this.operationContext = new OperationContext(this)
        this.componentContext = new ComponentContext(this)
        this.app.stores.forEach((StoreClass) => { this.initializeStore(StoreClass) })
    }

    public dehydrate(): HydrateState {
        const state: HydrateState = { stores: {}  }

        this.stores.forEach((store, storeName) => {
            state.stores[storeName] = store.dehydrate()
        })

        return state
    }

    public rehydrate(state: HydrateState) {
        this.app.stores.forEach((StoreClass) => {
            if (!state.stores[StoreClass.storeName]) return

            if (!this.stores.has(StoreClass.storeName)) {
                this.initializeStore(StoreClass)
            }

            this.stores.get(StoreClass.storeName)!.rehydrate(state.stores[StoreClass.storeName])
        })
    }

    public getStore<T extends StoreClass<any>>(StoreClass: T): InstanceType<T> {
        if (process.env.NODE_ENV !== 'production') {
            const storeRegistered = this.app.stores.has(StoreClass.storeName)
            invariant(storeRegistered, `Store ${StoreClass.storeName} is must be registered`)
        }

        return (this.stores.get(StoreClass.storeName) as any) || this.initializeStore(StoreClass)
    }

    public async executeOperation<T extends Operation<Actions>>(operation: T, arg: OperationArg<T>): Promise<void> {
        await Promise.resolve(operation(this.operationContext, arg))
    }

    public dispatch<A extends Actions>(actionIdentifier: A, payload: ExtractPayloadType<A>) {
        this.dispatcher.dispatch(actionIdentifier, payload)
    }

    private initializeStore(StoreClass: StoreClass<any>) {
        if (process.env.NODE_ENV !== 'production') {
            const storeRegistered = this.app.stores.has(StoreClass.storeName)
            invariant(storeRegistered, `Store ${StoreClass.storeName} is must be registered`)
        }

        const store = new StoreClass()
        const actionCallbackMap = new Map<ActionIdentifier<any>, ((payload: any) => void)[]>()
        this.stores.set(StoreClass.storeName, store)

        Object.keys(store)
            .filter(key => (store as any)[key] != null && (store as any)[key].__fleurHandler)
            .forEach(key => {
                const actionIdentifier = (store as any)[key].__action
                const actionCallbacks = actionCallbackMap.get(actionIdentifier) || []

                actionCallbacks.push((store as any)[key].producer)
                actionCallbackMap.set(actionIdentifier, actionCallbacks)
            })

        this.actionCallbackMap.set(StoreClass, actionCallbackMap)

        this.dispatcher.listen(action => {
            const actionCallbackMap = this.actionCallbackMap.get(StoreClass)!
            const handlers = actionCallbackMap.get(action.type)
            handlers && handlers.forEach((handler) => handler(action.payload))
        })

        return store
    }
}
