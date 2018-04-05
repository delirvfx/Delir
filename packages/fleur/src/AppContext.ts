import * as invariant from 'invariant'
import * as React from 'react'

import { Action } from 'Action'
import ActionContext from './ActionContext'
import ComponentContext from './ComponentContext'
import Dispatcher from './Dispatcher'
import Fleur from './Fleur'
import ComponentContextProvider from './react/ComponentContextProvider'
import Store from './Store'

export default class AppContext<Actions = Action<any>> {
    public dispatchr: Dispatcher
    public actionContext: ActionContext<any>
    public componentContext: ComponentContext
    public stores: { [storeName: string]: Store } = {}

    constructor(private app: Fleur) {
        this.dispatchr = new Dispatcher()
        this.actionContext = new ActionContext(this)
        this.componentContext = new ComponentContext(this)
    }

    public createElementWithContext(children: React.ReactChild) {
        return React.createElement(ComponentContextProvider.Provider, {
            value: this.componentContext
        }, children)
    }

    public getStore<T extends Store>(StoreClass: { new(...args: any[]): T}): T {
        const RegisteredStore = this.app.stores[StoreClass.name]
        invariant(RegisteredStore != null, `Store ${StoreClass.name} is must be registered`)

        if (!this.stores[RegisteredStore.name]) {
            this.stores[RegisteredStore.name] = new RegisteredStore()
        }

        return this.stores[RegisteredStore.name]
    }
}
