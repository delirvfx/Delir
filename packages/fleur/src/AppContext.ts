import * as invariant from 'invariant'
import * as React from 'react'

import {  ActionIdentifier, ExtractPayloadType } from 'Action'
import ActionContext from './ActionContext'
import ComponentContext from './ComponentContext'
import Dispatcher from './Dispatcher'
import Fleur from './Fleur'
import { Operation, OperationArg } from './Operations'
import ComponentContextProvider from './react/ComponentContextProvider'
import Store, { StoreClass } from './Store'

export default class AppContext<Actions extends ActionIdentifier<any> = ActionIdentifier<any>> {
    public dispatcher: Dispatcher
    public actionContext: ActionContext<any>
    public componentContext: ComponentContext
    public stores: Map<StoreClass, Store> = new Map()
    public actionCallbackMap: Map<StoreClass, Map<ActionIdentifier<any>, (payload: any) => void>> = new Map()

    constructor(private app: Fleur) {
        this.dispatcher = new Dispatcher()
        this.actionContext = new ActionContext(this)
        this.componentContext = new ComponentContext(this)
    }

    public getStore<T extends Store>(StoreClass: { new(...args: any[]): T}): T {
        if (process.env.NODE_ENV !== 'production') {
            const storeRegistered = this.app.stores.has(StoreClass)
            invariant(storeRegistered, `Store ${StoreClass.name} is must be registered`)
        }

        return this.stores.get(StoreClass) || this.initializeStore(StoreClass)
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
