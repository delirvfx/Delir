import * as invariant from 'invariant'
import * as React from 'react'

import { Action } from 'Action'
import ActionContext from './ActionContext'
import ComponentContext from './ComponentContext'
import Dispatcher from './Dispatcher'
import Fleur from './Fleur'
import ComponentContextProvider from './react/ComponentContextProvider'
import Store, { StoreClass } from './Store'

export default class AppContext<Actions = Action<any>> {
    public dispatcher: Dispatcher
    public actionContext: ActionContext<any>
    public componentContext: ComponentContext
    public stores: Map<StoreClass, Store> = new Map()
    public actionTypes: { [type: string]: symbol | string } = Object.create(null)

    constructor(private app: Fleur) {
        this.dispatcher = new Dispatcher()
        this.actionContext = new ActionContext(this)
        this.componentContext = new ComponentContext(this)
        app.stores.forEach(Store => { Object.keys(Store.handlers).forEach(key => this.actionTypes[key] = key)})
        console.log(this.actionTypes)
    }

    public createElementWithContext(children: React.ReactChild) {
        return React.createElement(ComponentContextProvider.Provider, {
            value: this.componentContext
        }, children)
    }

    public getStore<T extends Store>(StoreClass: { new(...args: any[]): T}): T {
        const storeRegistered = this.app.stores.has(StoreClass)
        invariant(storeRegistered, `Store ${StoreClass.name} is must be registered`)

        let store: Store | null = this.stores.get(StoreClass)

        if (!store) {
            store = new StoreClass()
            this.stores.set(StoreClass, store)

            this.dispatcher.listen(action => {
                store![StoreClass.handlers[action.type]]()
                store!.emitChange()
            })
        }

        return store as any
    }
}
